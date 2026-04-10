import type { Metadata } from "next";
import AIReadinessQuiz from "./AIReadinessQuiz";

export const metadata: Metadata = {
  title: "AI Readiness Quiz | Surim AI",
  description:
    "Take our AI Automation Readiness Quiz to discover your automation maturity level and get personalized recommendations from Luna.",
  openGraph: {
    title: "AI Readiness Quiz | Surim AI",
    description:
      "Discover your AI automation readiness level and unlock your free AI Marketing Toolkit.",
  },
};

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AIReadinessQuiz />
    </div>
  );
}
