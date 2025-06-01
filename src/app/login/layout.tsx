import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Synergies4",
  description: "Sign in to your Synergies4 account to access your AI-powered learning dashboard, courses, and personalized training programs.",
  keywords: ["Login", "Sign in", "Synergies4 account", "Learning dashboard", "Course access"],
  openGraph: {
    title: "Login - Synergies4",
    description: "Sign in to your Synergies4 account to access your AI-powered learning dashboard and courses.",
    url: "https://synergies4.com/login",
  },
  twitter: {
    title: "Login - Synergies4",
    description: "Sign in to your Synergies4 account to access your AI-powered learning dashboard and courses.",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 