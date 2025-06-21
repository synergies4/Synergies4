import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Customizer - AI-Powered Job Application Optimizer | Synergies4",
  description: "Transform your resume with AI for any job application. Get personalized cover letters, interview questions, and job fit analysis. Optimize your resume to match job requirements perfectly.",
  keywords: ["Resume customizer", "AI resume optimizer", "Job application", "Resume tailoring", "Cover letter generator", "Interview preparation", "Job fit analysis", "Resume keywords", "ATS optimization"],
  openGraph: {
    title: "Resume Customizer - AI-Powered Job Application Optimizer",
    description: "Transform your resume with AI for any job application. Get personalized cover letters, interview questions, and job fit analysis.",
    url: "https://synergies4.com/resume-customizer",
    type: "website",
  },
  twitter: {
    title: "Resume Customizer - AI-Powered Job Application Optimizer",
    description: "Transform your resume with AI for any job application. Get personalized cover letters, interview questions, and job fit analysis.",
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://synergies4.com/resume-customizer",
  }
};

export default function ResumeCustomizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 