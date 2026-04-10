import { useState } from "react";

type ContactFormStatus = "idle" | "submitting" | "success" | "error";
export type ContactVariant =
  | "home"
  | "tech"
  | "film"
  | "digital"
  | "media"
  | "academy"
  | "academy_marketing"
  | "tabb"
  | "default";

interface SubmitPayload {
  full_name: string;
  work_email: string;
  phone_number?: string;
  company?: string;
  project_budget?: string;
  project_goals?: string;
  source: string;
  order_status?: "pending" | "complete" | "error";
}

export const useContactForm = (opts?: {
  variant?: ContactVariant;
  source?: string; // page title or path (we’ll pass from slice)
}) => {
  const variant: ContactVariant = opts?.variant ?? "default";
  const [fullName, setFullName] = useState<string>("");
  const [workEmail, setWorkEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [projectBudget, setProjectBudget] = useState<string>("");
  const [projectGoals, setProjectGoals] = useState<string>("");
  const [formStatus, setFormStatus] = useState<ContactFormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setErrorMessage("");

    // required fields: full name, email, goals/message
    const requireGoals = variant !== "academy";

    const missingFields: string[] = [];
    if (!fullName) missingFields.push("Full Name");
    if (!workEmail) missingFields.push("Email");
    if (requireGoals && !projectGoals) missingFields.push("Message/Goals");

    if (missingFields.length) {
      setErrorMessage(
        `Please fill in all required fields (${missingFields.join(", ")}).`
      );
      setFormStatus("error");
      return;
    }

    // Build payload
    const payload: SubmitPayload = {
      full_name: fullName,
      work_email: workEmail,
      phone_number: phoneNumber || undefined,
      company: company || undefined, // optional everywhere
      source: opts?.source ?? "",
    };

    if (requireGoals && projectGoals) {
      payload.project_goals = projectGoals;
    }

    // Academy will later use Stripe; mark pending now
    if (variant === "academy") {
      payload.order_status = "pending";
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        success?: boolean;
        recordId?: string | number | null;
        message?: string;
      };

      if (!response.ok || !result?.success) {
        throw new Error(result?.message ?? "Unable to submit contact form.");
      }

      if (variant === "academy") {
        const contactId = result.recordId
          ? String(result.recordId)
          : undefined;

        if (!contactId) {
          throw new Error("Missing contact ID for Stripe checkout.");
        }

        const checkoutResponse = await fetch("/api/academy/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contactId,
            fullName,
            email: workEmail,
            source: opts?.source ?? "",
          }),
        });

        const checkoutResult = (await checkoutResponse.json()) as {
          success?: boolean;
          url?: string;
          message?: string;
        };

        if (!checkoutResponse.ok || !checkoutResult?.success || !checkoutResult.url) {
          throw new Error(
            checkoutResult?.message ?? "Unable to start Stripe checkout."
          );
        }

        window.location.href = checkoutResult.url;
        return;
      }

      setFormStatus("success");
      setFullName("");
      setWorkEmail("");
      setPhoneNumber("");
      setCompany("");
      setProjectBudget("");
      setProjectGoals("");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred.";
      setErrorMessage(`Failed to submit form: ${message}`);
      setFormStatus("error");
    }
  };

  return {
    variant,
    fullName,
    setFullName,
    workEmail,
    setWorkEmail,
    company,
    setCompany,
    phoneNumber,
    setPhoneNumber,
    projectBudget,
    setProjectBudget,
    projectGoals,
    setProjectGoals,
    formStatus,
    errorMessage,
    handleSubmit,
  };
};
