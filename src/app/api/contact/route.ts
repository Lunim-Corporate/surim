import { supabaseServer } from "@/lib/supabaseServer";
import { ContactLeadEmail } from "@/emails/ContactLeadEmail";
import { Resend } from "resend";
import { NextResponse } from "next/server";

interface ContactPayload {
  full_name: string;
  work_email: string;
  phone_number?: string;
  company?: string;
  project_budget?: string;
  project_goals?: string;
  source?: string;
  order_status?: "pending" | "complete" | "error";
}

interface OperationStatus {
  success: boolean;
  error?: string | null;
  recordId?: number | string | null;
  messageId?: string | null;
}

const normalizeRecipients = (value?: string | null) =>
  value
    ? value
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean)
    : [];

export async function POST(request: Request) {
  const body = (await request.json()) as ContactPayload;
  const supabase = supabaseServer();

  if (!body.full_name || !body.work_email) {
    return NextResponse.json(
      { success: false, message: "Missing required form fields." },
      { status: 400 }
    );
  }

  const insertPayload = {
    full_name: body.full_name,
    work_email: body.work_email,
    phone_number: body.phone_number ?? null,
    company: body.company ?? null,
    project_budget: body.project_budget ?? null,
    project_goals: body.project_goals ?? null,
    source: body.source ?? null,
    order_status: body.order_status ?? null,
  };

  const supabaseStatus: OperationStatus = { success: false, error: null, recordId: null };
  const emailStatus: OperationStatus = { success: false, error: null, messageId: null };

  try {
    const { data, error } = await supabase
      .from("contacts")
      .insert([insertPayload])
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    supabaseStatus.success = true;
    supabaseStatus.recordId = data?.id ?? null;
  } catch (error) {
    console.error(error);
    supabaseStatus.error =
      error instanceof Error ? error.message : "Unable to store contact submission.";
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toRecipients = normalizeRecipients(process.env.RESEND_CONTACT_RECIPIENTS);

  if (!resendApiKey) {
    emailStatus.error = "RESEND_API_KEY is not configured.";
  } else if (!fromEmail) {
    emailStatus.error = "RESEND_FROM_EMAIL is not configured.";
  } else if (!toRecipients.length) {
    emailStatus.error = "RESEND_CONTACT_RECIPIENTS is not configured.";
  } else {
    const resend = new Resend(resendApiKey);

    try {
      const submittedAt = new Date().toISOString();
      const summaryText = [
        `New contact enquiry`,
        `Name: ${body.full_name}`,
        `Email: ${body.work_email}`,
        body.phone_number ? `Phone: ${body.phone_number}` : null,
        body.project_goals ? `Message: ${body.project_goals}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: toRecipients,
        replyTo: body.work_email,
        subject: `New contact enquiry: ${body.full_name}`,
        react: ContactLeadEmail({
          fullName: body.full_name,
          workEmail: body.work_email,
          phoneNumber: body.phone_number ?? null,
          company: body.company ?? null,
          projectBudget: body.project_budget ?? null,
          projectGoals: body.project_goals ?? null,
          source: body.source ?? null,
          submittedAt,
        }),
        text: summaryText,
      });

      if (error) {
        throw new Error(error.message);
      }

      emailStatus.success = true;
      emailStatus.messageId = data?.id ?? null;
    } catch (error) {
      emailStatus.error =
        error instanceof Error ? error.message : "Unable to send notification email.";
    }
  }

  const responseBody = {
    success: supabaseStatus.success,
    recordId: supabaseStatus.recordId ?? null,
    message: supabaseStatus.success
      ? undefined
      : supabaseStatus.error ?? "Unable to store contact submission.",
    operations: {
      supabase: supabaseStatus,
      email: emailStatus,
    },
  };

  return NextResponse.json(
    responseBody,
    { status: supabaseStatus.success ? 200 : 500 }
  );
}
