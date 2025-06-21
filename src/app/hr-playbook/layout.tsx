import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HR Playbook - AI Workforce Integration Guide | Synergies4",
  description: "Comprehensive guide for HR professionals on integrating AI into workforce management. Get strategies, assessments, and best practices for successful AI workforce transformation.",
  keywords: ["HR Playbook", "AI workforce integration", "HR AI strategy", "Workforce transformation", "AI in HR", "HR technology", "Human resources AI", "Workforce planning"],
  openGraph: {
    title: "HR Playbook - AI Workforce Integration Guide",
    description: "Comprehensive guide for HR professionals on integrating AI into workforce management. Get strategies, assessments, and best practices.",
    url: "https://synergies4.com/hr-playbook",
    type: "website",
  },
  twitter: {
    title: "HR Playbook - AI Workforce Integration Guide",
    description: "Comprehensive guide for HR professionals on integrating AI into workforce management. Get strategies, assessments, and best practices.",
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://synergies4.com/hr-playbook",
  }
};

export default function HRPlaybookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 