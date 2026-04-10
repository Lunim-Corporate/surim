"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const LunaPortal = dynamic(
  () => import("./Luna").then((mod) => mod.LunaPortal),
  { ssr: false },
);

type AskLunaButtonProps = {
  className: string;
  label?: string;
};

export default function AskLunaButton({
  className,
  label = "Ask Luna",
}: AskLunaButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        {label}
      </button>
      {isOpen ? (
        <LunaPortal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      ) : null}
    </>
  );
}
