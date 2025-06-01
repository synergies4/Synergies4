import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industry Insights - Synergies4",
  description: "Stay ahead with the latest insights on AI, Agile transformation, leadership development, and industry trends. Expert analysis and thought leadership from Synergies4.",
  keywords: ["Industry insights", "AI trends", "Agile transformation", "Leadership insights", "Business trends", "Digital transformation", "Thought leadership"],
  openGraph: {
    title: "Industry Insights - Synergies4",
    description: "Stay ahead with the latest insights on AI, Agile transformation, leadership development, and industry trends.",
    url: "https://synergies4.com/industry-insight",
  },
  twitter: {
    title: "Industry Insights - Synergies4",
    description: "Stay ahead with the latest insights on AI, Agile transformation, leadership development, and industry trends.",
  },
};

export default function IndustryInsightLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 