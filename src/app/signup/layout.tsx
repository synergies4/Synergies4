import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Synergies4",
  description: "Create your Synergies4 account and start your AI-powered learning journey. Access personalized training programs, courses, and professional development resources.",
  keywords: ["Sign up", "Create account", "Synergies4 registration", "AI learning", "Professional development", "Training programs"],
  openGraph: {
    title: "Sign Up - Synergies4",
    description: "Create your Synergies4 account and start your AI-powered learning journey. Access personalized training programs and courses.",
    url: "https://synergies4.com/signup",
  },
  twitter: {
    title: "Sign Up - Synergies4",
    description: "Create your Synergies4 account and start your AI-powered learning journey. Access personalized training programs and courses.",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 