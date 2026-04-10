"use client";

type ScrollDownButtonProps = {
  className: string;
};

export default function ScrollDownButton({
  className,
}: ScrollDownButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        const current = document.getElementById("mainpage");
        if (!current) return;

        const next = current.nextElementSibling as HTMLElement | null;
        if (next) {
          next.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
      }}
      aria-label="Scroll down"
      className={className}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-7 h-7"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}
