import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Synergize AI - AI-Powered Agile Training Assistant",
  description: "Master Agile with AI-powered learning. Get role-specific guidance, generate presentations, simulate scenarios, and accelerate your Scrum mastery with our intelligent training assistant.",
  keywords: ["AI Agile training", "Scrum AI assistant", "Agile coaching AI", "Product owner training", "Scrum master AI", "AI-powered learning", "Agile simulation"],
  openGraph: {
    title: "Synergize AI - AI-Powered Agile Training Assistant",
    description: "Master Agile with AI-powered learning. Get role-specific guidance and accelerate your Scrum mastery with our intelligent training assistant.",
    url: "https://synergies4.com/synergize",
  },
  twitter: {
    title: "Synergize AI - AI-Powered Agile Training Assistant",
    description: "Master Agile with AI-powered learning. Get role-specific guidance and accelerate your Scrum mastery with our intelligent training assistant.",
  },
};

export default function SynergizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 