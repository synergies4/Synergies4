import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Synergies4",
  description: "Get in touch with Synergies4 for AI-powered training, coaching, and consulting services. Contact our team to discuss your professional development and organizational transformation needs.",
  keywords: ["Contact Synergies4", "AI training contact", "Professional development inquiry", "Coaching consultation", "Training inquiry", "Business consultation"],
  openGraph: {
    title: "Contact Us - Synergies4",
    description: "Get in touch with Synergies4 for AI-powered training, coaching, and consulting services. Contact our team to discuss your needs.",
    url: "https://synergies4.com/contact",
  },
  twitter: {
    title: "Contact Us - Synergies4",
    description: "Get in touch with Synergies4 for AI-powered training, coaching, and consulting services. Contact our team to discuss your needs.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 