"use client";

import { ArrowUp } from "lucide-react";

type BackToTopButtonProps = {
  label: string;
};

export default function BackToTopButton({
  label,
}: BackToTopButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="group flex items-center text-gray-500 transition-colors duration-300 hover:text-cyan-400"
      aria-label="Scroll to top"
    >
      {label}
      <ArrowUp className="ml-2 h-4 w-4 group-hover:animate-bounce" />
    </button>
  );
}
