import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pocket Coach - Personal AI Coach for Daily Challenges | Synergies4",
  description: "Get instant, personalized coaching with our AI-powered pocket coach. Navigate daily challenges, develop leadership skills, and achieve your goals with 24/7 AI guidance.",
  keywords: ["Personal AI coach", "Pocket coach", "AI coaching", "Leadership coaching", "Daily coaching", "AI mentor", "Personal development", "Professional coaching"],
  openGraph: {
    title: "Pocket Coach - Personal AI Coach for Daily Challenges",
    description: "Get instant, personalized coaching with our AI-powered pocket coach. Navigate daily challenges, develop leadership skills, and achieve your goals.",
    url: "https://synergies4.com/pocket-coach",
    type: "website",
  },
  twitter: {
    title: "Pocket Coach - Personal AI Coach for Daily Challenges",
    description: "Get instant, personalized coaching with our AI-powered pocket coach. Navigate daily challenges, develop leadership skills, and achieve your goals.",
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://synergies4.com/pocket-coach",
  }
};

export default function PocketCoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 