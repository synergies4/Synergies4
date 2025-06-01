import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Synergies4",
  description: "Read the latest insights, tips, and thought leadership on AI, Agile transformation, leadership development, and professional growth from the Synergies4 team.",
  keywords: ["Blog", "AI insights", "Agile blog", "Leadership articles", "Professional development", "Industry insights", "Thought leadership"],
  openGraph: {
    title: "Blog - Synergies4",
    description: "Read the latest insights on AI, Agile transformation, leadership development, and professional growth from the Synergies4 team.",
    url: "https://synergies4.com/blog",
  },
  twitter: {
    title: "Blog - Synergies4",
    description: "Read the latest insights on AI, Agile transformation, leadership development, and professional growth from the Synergies4 team.",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 