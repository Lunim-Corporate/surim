import * as React from "react";

export interface QuizResultEmailProps {
  name: string;
  score: number;
  category: "The Manualist" | "The Hybrid Optimizer" | "The Automation Architect";
  categoryDescription: string;
  toolkitLink: string;
}

const getEmailContent = (
  category: QuizResultEmailProps["category"],
  name: string
) => {
  const content = {
    "The Manualist": {
      subject: `Your AI Readiness Score is in! (Plus, a gift from Luna 🎁)`,
      greeting: `I've finished analyzing your quiz results! It looks like you are currently in The Manualist phase.`,
      situation: `Right now, you're doing the heavy lifting yourself, and AI is mostly sitting on the sidelines. You might feel a bit overwhelmed by how fast things are moving, or find yourself caught in the "Copy-Paste Shuffle."`,
      lunaTake: `Don't worry, this is actually the most exciting place to be. Why? Because you have the most to gain. By automating just 20% of your repetitive tasks, you're going to feel like you've suddenly gained an extra day in your work week.`,
      nextStep: `Start small. Focus on "Low-Value, High-Volume" tasks like scheduling and inbox sorting.`,
      closing: `To your growth,`
    },
    "The Hybrid Optimizer": {
      subject: `You're so close, ${name}! Here is your AI Readiness Report`,
      greeting: `I've just processed your answers, and you've landed in the Hybrid Optimizer category!`,
      situation: `You clearly know your way around AI, but you're still acting as the "bridge" between your tools. You're getting good results, but that last 20% of refinement and manual migration is still draining your energy.`,
      lunaTake: `You've built the engine, but we need to work on the transmission. You're at the stage where "connecting the dots" automatically is your biggest lever for growth. Let's move you away from being the "Copy-Paste" expert and toward being a true system builder.`,
      nextStep: `Look into "Zero-Friction" workflows where data flows from Point A to Point B without you touching it.`,
      closing: `Stay optimized,`
    },
    "The Automation Architect": {
      subject: `Impressive. You're an Automation Architect, ${name}`,
      greeting: `I've analysed your results, and I have to say, I'm impressed. You've reached the Automation Architect level.`,
      situation: `You aren't just using AI; you're building systems. You're proactive, you seek out new architectures, and you're focused on autonomous pipelines. You've moved past the "manual" struggle and are looking for 100% reliability.`,
      lunaTake: `At this level, your biggest challenge isn't "how" to use AI, it's how to scale it without friction. Your focus should be on "Audit vs. Execution." You should be spending your time auditing the logs of your autonomous projects while you focus on high-level strategy and growth.`,
      nextStep: `Keep pushing the boundaries of autonomous project execution. You're leading the pack.`,
      closing: `See you in the future,`
    }
  };

  return content[category];
};

export const QuizResultEmail = ({
  name,
  score,
  category,
  categoryDescription,
  toolkitLink,
}: QuizResultEmailProps) => {
  const emailContent = getEmailContent(category, name);
  
  return (
    <div
      style={{
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        backgroundColor: "#f9fafb",
        color: "#111827",
        padding: "0",
        margin: "0",
      }}
    >
      <table
        cellPadding={0}
        cellSpacing={0}
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <tr>
          <td
            style={{
              padding: "40px 20px",
            }}
          >
            <table
              cellPadding={0}
              cellSpacing={0}
              style={{
                maxWidth: "600px",
                width: "100%",
                margin: "0 auto",
                borderCollapse: "collapse",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <tr>
                <td
                  style={{
                    padding: "0px",
                  }}
                >
                   <img 
                    src="https://ai.surim.io/assets/email-banner.png" 
                    alt="Luna from Surim AI" 
                    style={{ 
                      width: '100%', 
                      height: 'auto', 
                      display: 'block' 
                    }} 
                  />
                 
                </td>
              </tr>

              <tr>
              <td style={{ padding: "32px 32px 24px 32px", borderBottom: "1px solid #e5e7eb" }}>
                <h1 style={{ margin: "0", color: "#111827", fontSize: "18px", fontWeight: "600" }}>
                  Hi {name},
                </h1>
              </td>
            </tr>

              <tr>
                <td style={{ padding: "32px" }}>
                  <p
                    style={{
                      margin: "0 0 20px 0",
                      color: "#374151",
                      fontSize: "15px",
                      lineHeight: "1.6",
                    }}
                  >
                    {emailContent.greeting}
                  </p>

                  <p
                    style={{
                      margin: "0 0 20px 0",
                      color: "#374151",
                      fontSize: "15px",
                      lineHeight: "1.6",
                    }}
                  >
                    {emailContent.situation}
                  </p>

                  <div
                    style={{
                      backgroundColor: "#f0f9ff",
                      border: "1px solid #bae6fd",
                      borderRadius: "8px",
                      padding: "20px",
                      margin: "24px 0",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 4px 0",
                        color: "#0369a1",
                        fontSize: "13px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Luna&apos;s Take:
                    </p>
                    <p
                      style={{
                        margin: "0",
                        color: "#075985",
                        fontSize: "15px",
                        lineHeight: "1.6",
                      }}
                    >
                      {emailContent.lunaTake}
                    </p>
                  </div>

                  <div style={{ margin: "24px 0" }}>
                    <p
                      style={{
                        margin: "0 0 8px 0",
                        color: "#111827",
                        fontSize: "15px",
                        fontWeight: "600",
                      }}
                    >
                      Your Next Step:
                    </p>
                    <p
                      style={{
                        margin: "0",
                        color: "#374151",
                        fontSize: "15px",
                        lineHeight: "1.6",
                      }}
                    >
                      {emailContent.nextStep}
                    </p>
                  </div>

                  {/* Toolkit Section */}
                  <p
                    style={{
                      margin: "24px 0 20px 0",
                      color: "#374151",
                      fontSize: "15px",
                      lineHeight: "1.6",
                    }}
                  >
                    {category === "The Automation Architect" 
                      ? "Here is your AI Marketing Toolkit. I think you'll find some high-level gems in here that match your workflow:"
                      : category === "The Hybrid Optimizer"
                      ? "I've attached your AI Marketing Toolkit below to help you level up:"
                      : "As promised, here is your AI Marketing Toolkit to help you start bridging that gap:"
                    }
                  </p>

                  <div style={{ textAlign: "center", margin: "32px 0" }}>
                    <a
                      href={toolkitLink}
                      style={{
                        display: "inline-block",
                        backgroundColor: "#00ccff",
                        color: "#000000",
                        textDecoration: "none",
                        padding: "14px 32px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "15px",
                      }}
                    >
                      Download Your Toolkit Here
                    </a>
                  </div>

                  <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid #e5e7eb" }}>
                    <p
                      style={{
                        margin: "0 0 4px 0",
                        color: "#374151",
                        fontSize: "15px",
                        lineHeight: "1.6",
                      }}
                    >
                      {emailContent.closing}
                    </p>
                    <p
                      style={{
                        margin: "0 0 2px 0",
                        color: "#111827",
                        fontSize: "15px",
                        fontWeight: "600",
                      }}
                    >
                      Luna 
                      <img 
                        src="https://ai.surim.io/assets/luna.png" 
                        alt="" 
                        style={{ width: '20px', verticalAlign: 'middle', marginLeft: '6px' }} 
                      />
                    </p>
                    <p
                      style={{
                        margin: "0",
                        color: "#6b7280",
                        fontSize: "14px",
                      }}
                    >
                      AI Specialist @ Surim
                    </p>
                  </div>
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    padding: "24px 32px",
                    backgroundColor: "#f9fafb",
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
                  <p
                    style={{
                      margin: "0",
                      color: "#9ca3af",
                      fontSize: "13px",
                      textAlign: "center",
                    }}
                  >
                    © {new Date().getFullYear()} Lunim. All rights reserved.
                    <br />
                    <a
                      href="https://surim.io"
                      style={{
                        color: "#0066ff",
                        textDecoration: "none",
                      }}
                    >
                      Visit Surim.io
                    </a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  );
};

QuizResultEmail.displayName = "QuizResultEmail";
