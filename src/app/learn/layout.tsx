import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn - Synergies4",
  description: "Access your personalized learning experience with AI-powered courses, interactive lessons, and progress tracking. Continue your professional development journey.",
  keywords: ["Learn", "Online learning", "Course lessons", "Interactive learning", "Progress tracking", "Professional development", "AI-powered education"],
  openGraph: {
    title: "Learn - Synergies4",
    description: "Access your personalized learning experience with AI-powered courses and interactive lessons.",
    url: "https://synergies4.com/learn",
  },
  twitter: {
    title: "Learn - Synergies4",
    description: "Access your personalized learning experience with AI-powered courses and interactive lessons.",
  },
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 