import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { SliceComponentProps } from "@prismicio/react";
import { Content } from "@prismicio/client";
import Link from "next/link";
import BackToTopButton from "./BackToTopButton";

const bubbles = [
  { id: 0, size: 28, duration: 14, delay: 0, x: 8 },
  { id: 1, size: 42, duration: 18, delay: 1, x: 21 },
  { id: 2, size: 18, duration: 12, delay: 2, x: 36 },
  { id: 3, size: 34, duration: 16, delay: 3, x: 52 },
  { id: 4, size: 24, duration: 20, delay: 1, x: 68 },
  { id: 5, size: 46, duration: 17, delay: 4, x: 82 },
];

/**
 * Props for `Footer`.
 */
export type FooterProps = SliceComponentProps<Content.FooterSlice>;

/**
 * Component for "Footer" Slices.
 */
const Footer = ({ slice }: FooterProps) => {
  const {
    company_name,
    tagline,
    contact_information_title,
    company_email,
    company_phone_number,
    company_address,
    copyright_text,
    privacy_policy,
    back_to_top_text,
  } = slice.primary;

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 pt-16 pb-8 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 h-1/3 w-full bg-gradient-to-b from-cyan-500/5 to-transparent"></div>
        <div className="absolute right-0 bottom-0 h-1/2 w-1/2 bg-gradient-to-t from-purple-500/5 to-transparent"></div>
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="animate-float absolute rounded-full bg-gradient-to-br from-cyan-400/10 to-purple-500/5"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.x}%`,
              animationDuration: `${bubble.duration}s`,
              animationDelay: `${bubble.delay}s`,
              bottom: "-30px",
            }}
          />
        ))}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6,182,212,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.1) 1px,transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-2xl font-bold text-transparent">
              <PrismicRichText field={company_name} />
            </div>
            <div className="max-w-xs text-gray-400">{tagline}</div>
          </div>

          <div>
            <div className="mb-4 text-lg font-semibold text-cyan-400">
              <PrismicRichText field={contact_information_title} />
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="mt-1 mr-3 h-5 w-5 shrink-0 text-cyan-400" />
                <Link
                  href={`mailto:${company_email}`}
                  className="text-gray-400 transition-colors duration-300 no-underline hover:text-cyan-400"
                >
                  {company_email}
                </Link>
              </div>
              <div className="flex items-start">
                <Phone className="mt-1 mr-3 h-5 w-5 shrink-0 text-cyan-400" />
                <Link
                  href={`tel:${company_phone_number}`}
                  className="text-gray-400 transition-colors duration-300 no-underline hover:text-cyan-400"
                >
                  {company_phone_number}
                </Link>
              </div>
              <div className="flex items-start">
                <MapPin className="mt-1 mr-3 h-5 w-5 shrink-0 text-cyan-400" />
                <span className="text-gray-400">{company_address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between border-t border-gray-800 pt-8 md:flex-row">
          <div className="mb-4 text-sm text-gray-500 md:mb-0">
            &copy; {new Date().getFullYear()} {copyright_text}
          </div>
          <div className="flex items-center space-x-6">
            <PrismicNextLink
              field={privacy_policy}
              className="flex items-center text-sm text-gray-500 transition-colors duration-300 no-underline hover:text-cyan-400"
            >
              {privacy_policy.text} <ExternalLink className="ml-1 h-3 w-3" />
            </PrismicNextLink>
            <BackToTopButton label={back_to_top_text || "Back to top"} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.9; }
        }
        .animate-float { animation: float 15s ease-in-out infinite; }
      `}</style>
    </footer>
  );
};

export default Footer;
