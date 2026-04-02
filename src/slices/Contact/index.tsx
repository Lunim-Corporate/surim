"use client";
import { FC, useMemo, type ComponentType } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { asText } from "@prismicio/helpers";
import { Clock, Mail, Phone, LucideProps } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import type { ContactVariant } from "@/hooks/useContactForm";
import type { Content } from "@prismicio/client";
import model from "@/slices/Contact/model.json";
import { usePathname } from "next/navigation";

/**
 * Props for `Contact`.
 */
export type ContactProps = SliceComponentProps<Content.ContactSlice>;

const budgetOptions: string[] =
  model.variations[0].primary.budget_options.config.options;

const iconComponents: Record<string, ComponentType<LucideProps>> = {
  Clock,
  Mail,
  Phone,
};

const Contact: FC<ContactProps> = ({ slice }) => {
  const pathname = usePathname();

  // Route-based variant to drive copy & field visibility
  const variant = useMemo<ContactVariant>(() => {
    const p = pathname.replace(/\/+$/, "") || "/";
    if (p === "/") return "home";
    if (p === "/tabb" || p.startsWith("/tabb/")) return "tabb";
    if (p === "/digital" || p.startsWith("/digital/")) return "digital";
    if (p === "/media" || p.startsWith("/media/")) return "media";
    if (p.startsWith("/academy/marketing")) return "academy_marketing";
    if (p === "/academy" || p.startsWith("/academy/")) return "academy";
    return "default";
  }, [pathname]);

  const isDigital = variant === "digital";

  // Title overrides per page
  const computedMainTitle = (() => {
    // if (variant === "home" || variant === "media") return "Ready to Go?";
    // if (variant === "academy") return "Ready to Transform your Team?";
    // if (isDigital) return "Ready to Innovate?";
    return asText(slice.primary.main_title) || "Ready to Go?";
  })();

  const computedSubtitle = (() => {
    // if (variant === "home" || variant === "media")
    //   return "Let’s discuss how we can help you take your next giant leap.";
    // if (variant === "academy")
    //   return "Let’s get you on the road to powering up your workflow.";
    // if (isDigital)
    //   return "Let's discuss your project and how we can bring it to life.";
    return asText(slice.primary.subtitle) || "";
  })();

  // Left panels content adjustments:
  const waysTitle = asText(slice.primary.contact_us_title); //isDigital ? "Why Contact Us?" : "Ways to Contact Us";
  const waysSubtitle = asText(slice.primary.contact_us_subtitle); // "We respond to all queries within 24 hours";

  const contactItems = slice.primary.contact_info || [];
  const officeHourItems = slice.primary.office_info || [];

  // Hidden source to send with submission (page title + path)
  const sourceValue = useMemo<string>(() => {
    const cleanPath = pathname.replace(/\/+$/, "") || "/";
    return cleanPath;
  }, [pathname]);

  return (
    <section
      className={`py-16 ${
        isDigital
          ? "relative overflow-hidden bg-gradient-to-b from-[#040a18] via-[#071327] to-[#03070f]"
          : "bg-[#0f172a]"
      }`}
      id="get-in-touch"
    >
      {isDigital && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(88,214,255,0.22),transparent_60%)]" />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Title */}
        <div
          className={`${
            isDigital ? "text-4xl md:text-5xl" : "text-3xl"
          } font-bold text-white mb-4 text-center`}
        >
          <span>{computedMainTitle}</span>
        </div>

        {/* Subtitle */}
        {computedSubtitle && (
          <div
            className={`${
              isDigital ? "text-lg md:text-xl text-white/70" : "text-lg text-gray-300"
            } mb-12 text-center`}
          >
            <span>{computedSubtitle}</span>
          </div>
        )}

        <div
          className={
            variant === "tabb"
              ? "flex justify-center"
              : isDigital
              ? "grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-10 items-start relative"
              : "grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
          }
        >
          {/* Left column: Ways to Contact + Office Hours */}
          {variant !== "tabb" && (
            <div className="space-y-8 relative">
              <div
                className={
                  isDigital
                    ? "relative overflow-hidden rounded-2xl border border-white/10 bg-[#111d33]/90 p-4 md:p-6 lg:p-8 shadow-[0_24px_45px_rgba(5,12,32,0.55)] backdrop-blur"
                    : "bg-[#1a202c] p-4 md:p-6 lg:p-8 rounded-lg shadow-xl border border-white"
                }
              >
                <h3 className="text-xl font-bold text-white !mt-1 !mb-2">
                  {waysTitle}
                </h3>
                {waysSubtitle && (
                  <p className="text-gray-300 !mb-6">{waysSubtitle}</p>
                )}
                <ul className="space-y-7 list-none">
                  {contactItems.map((item: any, index: number) => {
                    const Icon = iconComponents[item.icon_name || ""] || Clock;
                    const rawTitle =
                      typeof item.title === "string" ? item.title.trim() : "";
                    const isQuickResponse =
                      rawTitle.toLowerCase() === "quick response";
                    const displayTitle =
                      !isDigital && isQuickResponse ? "Want to Meet?" : rawTitle;
                    const hasLabel = displayTitle.length > 0;
                    const rawDescription =
                      typeof item.description === "string"
                        ? item.description.trim()
                        : "";
                    const hasDesc = rawDescription.length > 0;
                    if (!hasLabel && !hasDesc) return null;

                    const descriptionContent =
                      isQuickResponse ? (
                        <a
                          href="https://calendly.com/hello-lunim/30min"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-300 underline underline-offset-4 hover:no-underline hover:text-cyan-100 transition-colors"
                        >
                          Book a meeting with us now
                        </a>
                      ) : hasDesc ? (
                        <span className={isDigital ? "text-white/60" : "text-gray-300"}>
                          {rawDescription}
                        </span>
                      ) : null;

                    return (
                      <li
                        key={index}
                        className="flex items-start gap-4 pl-0"
                      >
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            isDigital
                              ? "bg-white/5 text-[#8df6ff] shadow-[0_0_20px_rgba(101,225,255,0.35)]"
                              : "bg-white/10 text-[#BBFEFF]"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="space-y-1">
                          {hasLabel && (
                            <p
                              className={`font-semibold text-white !mb-0 ${
                                isDigital ? "text-lg" : "text-base"
                              }`}
                            >
                              {displayTitle}
                            </p>
                          )}
                          {descriptionContent}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div
                className={
                  isDigital
                    ? "relative overflow-hidden rounded-2xl border border-white/10 bg-[#111d33]/90 p-4 md:p-6 lg:p-8 shadow-[0_24px_45px_rgba(5,12,32,0.55)] backdrop-blur"
                    : "bg-[#1a202c] p-4 md:p-6 lg:p-8 rounded-lg shadow-xl border border-white"
                }
              >
                <h3
                  className={`${
                    isDigital
                      ? "text-2xl font-semibold text-white mb-6 !mt-1"
                      : "text-xl font-bold text-white mt-1 mb-6 !mt-1"
                  }`}
                >
                  {asText(slice.primary.office_hours_title) || "Office Hours"}
                </h3>
                <ul
                  className={`space-y-3 ${
                    isDigital ? "text-white/70" : "text-gray-300"
                  }`}
                >
                  {officeHourItems.map((hour: any, index: number) => (
                    <li
                      key={index}
                      className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/5 pb-3 last:border-b-0 last:pb-0"
                    >
                      <span
                        className={`font-semibold mb-1.5 sm:mb-0 ${
                          isDigital ? "text-white" : ""
                        }`}
                      >
                        {hour.days}
                      </span>
                      {hour.is_closed ? (
                        <span className="text-red-400">Closed</span>
                      ) : (
                        <span className="text-white/70">{hour.hours}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Right column: Form */}
          <div
            className={
              variant === "tabb"
                ? "flex justify-center items-center w-full max-w-lg"
                : undefined
            }
          >
            <ContactForm
              title={slice.primary.form_title}
              fullNameLabel={slice.primary.full_name_field_label ?? undefined}
              emailLabel={slice.primary.email_field_label ?? undefined}
              companyLabel={slice.primary.company_field_label ?? undefined}
              budgetLabel={slice.primary.project_budget_label ?? undefined}
              goalsLabel={slice.primary.project_goals_label ?? undefined}
              buttonLabel={slice.primary.button_label ?? undefined}
              budgetOptions={budgetOptions ?? undefined}
              variant={variant}
              source={sourceValue}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
