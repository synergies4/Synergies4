import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Goal Setting Studio - AI-Powered Goal Planning & Tracking | Synergies4',
  description: 'Transform your aspirations into actionable plans with our AI-powered goal setting platform. Create, track, and achieve your career and personal objectives with expert templates and progress tracking.',
  keywords: 'goal setting, career planning, personal development, goal tracking, AI goal planner, career goals, life goals, professional development',
  authors: [{ name: 'Synergies4' }],
  openGraph: {
    title: 'Goal Setting Studio - AI-Powered Goal Planning & Tracking | Synergies4',
    description: 'Transform your aspirations into actionable plans with our AI-powered goal setting platform. Create, track, and achieve your career and personal objectives.',
    url: 'https://synergies4ai.com/goal-setting',
    siteName: 'Synergies4',
    images: [
      {
        url: '/og-goal-setting.jpg',
        width: 1200,
        height: 630,
        alt: 'Synergies4 Goal Setting Studio'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Goal Setting Studio - AI-Powered Goal Planning & Tracking | Synergies4',
    description: 'Transform your aspirations into actionable plans with our AI-powered goal setting platform. Create, track, and achieve your career and personal objectives.',
    images: ['/og-goal-setting.jpg'],
  },
  alternates: {
    canonical: 'https://synergies4ai.com/goal-setting',
  },
};

export default function GoalSettingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
