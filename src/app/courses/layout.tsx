import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses - Synergies4",
  description: "Discover our comprehensive collection of AI-powered, role-based training programs designed to accelerate your professional growth. Master Agile, leadership, and mental fitness with expert-led courses.",
  keywords: ["AI courses", "Agile training courses", "Leadership development", "Professional training", "Scrum certification", "Product management courses", "Mental fitness training"],
  openGraph: {
    title: "Courses - Synergies4",
    description: "Discover our comprehensive collection of AI-powered, role-based training programs designed to accelerate your professional growth.",
    url: "https://synergies4.com/courses",
  },
  twitter: {
    title: "Courses - Synergies4",
    description: "Discover our comprehensive collection of AI-powered, role-based training programs designed to accelerate your professional growth.",
  },
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 