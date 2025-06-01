import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { PerformanceOptimizer } from "@/components/PerformanceOptimizer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Synergies4 - AI-Powered Learning",
  description: "AI-powered learning tailored uniquely to you and your organization. Master Agile, leadership, and mental fitness with our comprehensive training programs.",
  keywords: ["AI learning", "Agile training", "Leadership development", "Professional development", "Scrum training", "Product management", "Mental fitness"],
  authors: [{ name: "Synergies4" }],
  creator: "Synergies4",
  publisher: "Synergies4 LLC",
  
  // Favicon and icons
  icons: {
    icon: [
      { url: "/synergies4_logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: "/synergies4_logo.svg",
    shortcut: "/synergies4_logo.svg"
  },
  
  // Open Graph / Facebook
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://synergies4.com",
    siteName: "Synergies4",
    title: "Synergies4 - AI-Powered Learning Platform",
    description: "Transform your career with AI-powered learning. Master Agile, leadership, and mental fitness with expert-led training programs.",
    images: [
      {
        url: "/synergies4_logo.jpeg",
        width: 1200,
        height: 630,
        alt: "Synergies4 - AI-Powered Learning Platform"
      }
    ]
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    site: "@synergies4",
    creator: "@synergies4",
    title: "Synergies4 - AI-Powered Learning Platform",
    description: "Transform your career with AI-powered learning. Master Agile, leadership, and mental fitness with expert-led training programs.",
    images: ["/synergies4_logo.jpeg"]
  },
  
  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Verification
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  
  // App-specific
  applicationName: "Synergies4",
  category: "Education",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent zoom on mobile for better UX
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <PerformanceOptimizer />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
