"use client";
import React from "react";
import { Loader2 } from "lucide-react";
import { useContactForm, type ContactVariant } from "../hooks/useContactForm";
import { asText } from "@prismicio/helpers";
import type { RichTextField } from "@prismicio/types";

interface ContactFormProps {
  title?: RichTextField;
  fullNameLabel?: string;
  emailLabel?: string;
  companyLabel?: string;
  phoneLabel?: string;
  budgetLabel?: string;
  goalsLabel?: string;
  buttonLabel?: string;
  budgetOptions?: string[];
  variant?: ContactVariant; // NEW
  source?: string; // NEW (page title + path from slice)
}

const ContactForm: React.FC<ContactFormProps> = ({
  title,
  fullNameLabel,
  emailLabel,
  companyLabel,
  phoneLabel,
  budgetLabel,
  goalsLabel,
  buttonLabel,
  budgetOptions,
  variant = "default",
  source = "",
}) => {
  const resolvedTitle = title ? asText(title) : "Get In Touch";
  const isTabb = variant === "tabb";
  const formHook = useContactForm({ variant, source });

  if (isTabb) {
    const tabbHref = "https://tabb.cc/";
    const tabbLabel = buttonLabel || "Visit Tabb";
    return (
      <div
        className="bg-[#1a202c] p-4 md:p-6 lg:p-8 rounded-lg shadow-xl border border-white text-center space-y-6"
        style={{ scrollMarginTop: "5rem" }}
      >
        <h3 className="text-xl font-bold text-white mt-1">{resolvedTitle}</h3>
        <p className="text-gray-300">
          Continue your journey with{" "}
          <span className="text-white font-semibold">Tabb</span>.
        </p>
        <a
          href={tabbHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold bg-[#BBFEFF] text-black hover:bg-cyan-300 transition-colors duration-300 shadow-lg no-underline"
        >
          {tabbLabel}
        </a>
      </div>
    );
  }

  const {
    fullName,
    setFullName,
    workEmail,
    setWorkEmail,
    phoneNumber,
    setPhoneNumber,
    company,
    setCompany,
    projectBudget,
    setProjectBudget,
    projectGoals,
    setProjectGoals,
    formStatus,
    errorMessage,
    handleSubmit,
  } = formHook;

  const messageVariants =
    variant === "home" || variant === "media" || variant === "academy" || variant === "academy_marketing";
  const showBudget: boolean =
    variant === "digital" && Array.isArray(budgetOptions) && budgetOptions.length > 0;
  const showGoalsField = true;
  const computedGoalsLabel: string =
    messageVariants
      ? "Message *"
      : `${goalsLabel || "Project Goals *"}`;
  const computedButton: string = buttonLabel || "Send Enquiry";
  const placeholderMsg: string =
    messageVariants
      ? "What would you like to talk about?"
      : "Tell us about your idea…";

  return (
    <div
      id="get-in-touch"
      className="bg-[#1a202c] p-4 md:p-6 lg:p-8 rounded-lg shadow-xl border border-white"
      style={{ scrollMarginTop: "5rem" }}
    >
      <h3 className="text-xl font-bold text-white !mt-1 !mb-6 text-center">
        {resolvedTitle}
      </h3>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left"
      >
        <input type="hidden" name="source" value={source} />
        <FormField
          id="fullName"
          label={fullNameLabel || "Your full name *"}
          value={fullName}
          onChange={setFullName}
          placeholder="Your Full Name"
          required
        />

        <FormField
          id="workEmail"
          label={emailLabel || "Your Email *"}
          type="email"
          value={workEmail}
          onChange={setWorkEmail}
          placeholder="Your Email Address"
          required
        />

        <FormField
          id="phoneNumber"
          label={phoneLabel || "Phone Number (optional)"}
          type="tel"
          value={phoneNumber}
          onChange={setPhoneNumber}
          placeholder="+44 20 1234 5678"
          autoComplete="tel"
        />

        {/* Company is optional everywhere */}
        <FormField
          id="company"
          label={
            companyLabel
              ? `${companyLabel}`
              : "Company Name (optional)"
          }
          value={company}
          onChange={setCompany}
          placeholder="Your Company Name"
        />

        {/* Budget: only on Digital page */}
        {showBudget && (
          <div>
            <label
              htmlFor="projectBudget"
              className="block text-gray-300 text-base font-semibold mb-2"
            >
              {budgetLabel || "Project Budget"}
            </label>
            <div className="relative">
              <select
                id="projectBudget"
                name="projectBudget"
                value={projectBudget || ""}
                onChange={(e) => setProjectBudget(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#1f2937] border border-gray-700 text-white appearance-none focus:outline-none focus:border-blue-500 pr-10"
              >
                <option value="" disabled hidden>
                  Select a budget range
                </option>
                {(budgetOptions ?? []).map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div
                className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-200"
              >
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {showGoalsField && (
          <div className="md:col-span-2">
            <label
              htmlFor="projectGoals"
              className="block text-gray-300 text-base font-semibold mb-2"
            >
              {computedGoalsLabel}
            </label>
            <textarea
              id="projectGoals"
              name="projectGoals"
              rows={5}
              placeholder={placeholderMsg}
              value={projectGoals}
              onChange={(e) => setProjectGoals(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#1f2937] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        )}

        {formStatus === "submitting" && (
          <p className="md:col-span-2 text-center text-blue-400">
            Submitting...
          </p>
        )}
        {formStatus === "success" && (
          <p className="md:col-span-2 text-center text-green-400">
            Submitted!
          </p>
        )}
        {formStatus === "error" && (
          <p className="md:col-span-2 text-center text-red-400">
            {errorMessage}
          </p>
        )}

        <div className="md:col-span-2 text-center">
          <button
            type="submit"
            disabled={formStatus === "submitting"}
            className="bg-[#BBFEFF] text-black px-8 py-4 rounded-lg font-semibold 
                       hover:bg-cyan-300 transition-colors duration-300 
                       shadow-lg inline-flex items-center justify-center space-x-2"
          >
            {formStatus === "submitting" ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...
              </>
            ) : (
              computedButton
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const FormField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel";
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}> = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  autoComplete,
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-gray-300 text-base font-semibold mb-2"
    >
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      placeholder={placeholder}
      value={value}
      required={required}
      autoComplete={autoComplete}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 rounded-lg bg-[#1f2937] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
    />
  </div>
);

export default ContactForm;
