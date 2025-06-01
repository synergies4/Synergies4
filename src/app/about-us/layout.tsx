import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - Synergies4",
  description: "Learn about Synergies4's mission to help teams lead better, adapt faster, and work smarter with AI. We're integration partners who train people to think clearly, lead confidently, and build organizations that thrive in complexity.",
  keywords: ["About Synergies4", "AI training company", "Professional development", "Agile transformation", "Leadership coaching", "Team development"],
  openGraph: {
    title: "About Us - Synergies4",
    description: "Learn about Synergies4's mission to help teams lead better, adapt faster, and work smarter with AI.",
    url: "https://synergies4.com/about-us",
  },
  twitter: {
    title: "About Us - Synergies4",
    description: "Learn about Synergies4's mission to help teams lead better, adapt faster, and work smarter with AI.",
  },
};

export default function AboutUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 