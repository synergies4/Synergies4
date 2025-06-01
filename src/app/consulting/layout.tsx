import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consulting - Synergies4",
  description: "Accelerate your organization's transformation with our AI-powered consulting services. Expert guidance for Agile adoption, digital transformation, and organizational change management.",
  keywords: ["AI consulting", "Agile consulting", "Digital transformation", "Organizational change", "Business transformation", "Agile coaching", "Change management"],
  openGraph: {
    title: "Consulting - Synergies4",
    description: "Accelerate your organization's transformation with our AI-powered consulting services. Expert guidance for Agile adoption and digital transformation.",
    url: "https://synergies4.com/consulting",
  },
  twitter: {
    title: "Consulting - Synergies4",
    description: "Accelerate your organization's transformation with our AI-powered consulting services. Expert guidance for Agile adoption and digital transformation.",
  },
};

export default function ConsultingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 