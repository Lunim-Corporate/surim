import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const COMPLETED_EVENT_TYPES = new Set<string>([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

const FAILED_EVENT_TYPES = new Set<string>([
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
]);

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { received: false, message: "Missing Stripe webhook configuration." },
      { status: 400 }
    );
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stripe signature verification failed.";
    return NextResponse.json({ received: false, message }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const contactId = typeof session.client_reference_id === "string" ? session.client_reference_id : null;

  if (!contactId) {
    return NextResponse.json(
      { received: false, message: "Missing contact record identifier." },
      { status: 400 }
    );
  }

  const supabase = supabaseServer();

  if (COMPLETED_EVENT_TYPES.has(event.type)) {
    await supabase
      .from("contacts")
      .update({ order_status: "complete" })
      .eq("id", contactId);
  } else if (FAILED_EVENT_TYPES.has(event.type)) {
    await supabase
      .from("contacts")
      .update({ order_status: "error" })
      .eq("id", contactId);
  }

  return NextResponse.json({ received: true });
}
