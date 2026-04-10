import * as React from "react";

export interface ContactLeadEmailProps {
  fullName: string;
  workEmail: string;
  phoneNumber?: string | null;
  company?: string | null;
  projectBudget?: string | null;
  projectGoals?: string | null;
  source?: string | null;
  submittedAt?: string;
}

const detailRow = (label: string, value?: string | null) => {
  if (!value) {
    return null;
  }

  return (
    <tr>
      <td
        style={{
          fontWeight: 600,
          padding: "6px 12px 6px 0",
          fontSize: "14px",
          verticalAlign: "top",
        }}
      >
        {label}
      </td>
      <td
        style={{
          color: "#0f172a",
          padding: "6px 0",
          fontSize: "14px",
        }}
      >
        {value}
      </td>
    </tr>
  );
};

export const ContactLeadEmail = ({
  fullName,
  workEmail,
  phoneNumber,
  company,
  projectBudget,
  projectGoals,
  source,
  submittedAt,
}: ContactLeadEmailProps) => (
  <div
    style={{
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      backgroundColor: "#f8fafc",
      padding: "32px",
      color: "#0f172a",
    }}
  >
    <div
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "32px",
        boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
      }}
    >
      <h1 style={{ fontSize: "20px", margin: "0 0 12px" }}>
        New contact enquiry
      </h1>
      <p style={{ margin: "0 0 24px", lineHeight: 1.6 }}>
        {fullName} just submitted the contact form
        {source ? ` via ${source}` : ""}. Please review the details below.
      </p>

      <table
        cellPadding={0}
        cellSpacing={0}
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        {detailRow("Full name", fullName)}
        {detailRow("Email", workEmail)}
        {detailRow("Phone", phoneNumber)}
        {detailRow("Company", company)}
        {detailRow("Budget", projectBudget)}
        {detailRow("Source", source)}
        {detailRow("Submitted", submittedAt)}
      </table>

      {projectGoals && (
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            borderRadius: "12px",
            backgroundColor: "#f1f5f9",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontWeight: 600,
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#334155",
            }}
          >
            Message
          </p>
          <p style={{ margin: 0, whiteSpace: "pre-line", lineHeight: 1.6 }}>
            {projectGoals}
          </p>
        </div>
      )}
    </div>
  </div>
);

ContactLeadEmail.displayName = "ContactLeadEmail";
