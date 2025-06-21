import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ROI Engine - Course Investment Calculator | Synergies4",
  description: "Calculate the ROI of professional development courses with our AI-powered engine. Get personalized course recommendations and precise ROI projections based on your career profile.",
  keywords: ["ROI calculator", "Course ROI", "Training investment", "Professional development ROI", "Course value calculator", "Career ROI", "Learning investment", "Training ROI calculator"],
  openGraph: {
    title: "ROI Engine - Course Investment Calculator",
    description: "Calculate the ROI of professional development courses with our AI-powered engine. Get personalized course recommendations and precise ROI projections.",
    url: "https://synergies4.com/roi-engine",
    type: "website",
  },
  twitter: {
    title: "ROI Engine - Course Investment Calculator",
    description: "Calculate the ROI of professional development courses with our AI-powered engine. Get personalized course recommendations and precise ROI projections.",
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://synergies4.com/roi-engine",
  }
};

export default function ROIEngineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 