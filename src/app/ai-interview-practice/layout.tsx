import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Interview Practice - Mock Interviews with AI Feedback | Synergies4",
  description: "Practice job interviews with AI-powered feedback. Get realistic interview questions, record your responses, and receive personalized coaching to improve your interview skills.",
  keywords: ["AI interview practice", "Mock interview", "Interview preparation", "Interview coaching", "Job interview practice", "AI feedback", "Interview skills", "Interview questions"],
  openGraph: {
    title: "AI Interview Practice - Mock Interviews with AI Feedback",
    description: "Practice job interviews with AI-powered feedback. Get realistic interview questions, record your responses, and receive personalized coaching.",
    url: "https://synergies4.com/ai-interview-practice",
    type: "website",
  },
  twitter: {
    title: "AI Interview Practice - Mock Interviews with AI Feedback",
    description: "Practice job interviews with AI-powered feedback. Get realistic interview questions, record your responses, and receive personalized coaching.",
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://synergies4.com/ai-interview-practice",
  }
};

export default function AIInterviewPracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 