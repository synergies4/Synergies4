import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Synergies4",
  description: "Your personalized learning dashboard. Track your progress, access courses, view achievements, and manage your AI-powered professional development journey.",
  keywords: ["Learning dashboard", "Course progress", "Training dashboard", "Professional development", "Learning analytics", "Course management"],
  openGraph: {
    title: "Dashboard - Synergies4",
    description: "Your personalized learning dashboard. Track your progress and manage your AI-powered professional development journey.",
    url: "https://synergies4.com/dashboard",
  },
  twitter: {
    title: "Dashboard - Synergies4",
    description: "Your personalized learning dashboard. Track your progress and manage your AI-powered professional development journey.",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 