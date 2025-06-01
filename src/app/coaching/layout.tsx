import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coaching - Synergies4",
  description: "Transform your leadership with personalized AI-powered coaching. Develop mental fitness, emotional intelligence, and leadership skills with our expert coaches and cutting-edge technology.",
  keywords: ["Leadership coaching", "AI coaching", "Mental fitness coaching", "Executive coaching", "Personal development", "Leadership development", "Performance coaching"],
  openGraph: {
    title: "Coaching - Synergies4",
    description: "Transform your leadership with personalized AI-powered coaching. Develop mental fitness, emotional intelligence, and leadership skills.",
    url: "https://synergies4.com/coaching",
  },
  twitter: {
    title: "Coaching - Synergies4",
    description: "Transform your leadership with personalized AI-powered coaching. Develop mental fitness, emotional intelligence, and leadership skills.",
  },
};

export default function CoachingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 