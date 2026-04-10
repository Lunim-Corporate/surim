import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripeClient } from "@/lib/stripe";

interface CheckoutPayload {
  contactId: string;
  fullName: string;
  email: string;
  source?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as CheckoutPayload;
  const stripePriceId =
    process.env.STRIPE_ACADEMY_PRICE_ID ?? process.env.STRIPE_PRICE_ID;

  if (!stripePriceId) {
    return NextResponse.json(
      { success: false, message: "Stripe price identifier is not configured." },
      { status: 500 }
    );
  }

  if (!body?.contactId || !body?.email || !body?.fullName) {
    return NextResponse.json(
      { success: false, message: "Missing required checkout data." },
      { status: 400 }
    );
  }

  const headersList = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    headersList.get("origin");

  if (!origin) {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to resolve redirect origin for Stripe checkout.",
      },
      { status: 500 }
    );
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: body.email,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      client_reference_id: body.contactId,
      metadata: {
        contact_id: body.contactId,
        source: body.source ?? "academy",
        full_name: body.fullName,
      },
      success_url: `${origin}/academy?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/academy?checkout=cancelled`,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Unknown Stripe error.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
