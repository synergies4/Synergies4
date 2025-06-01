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
  
  // Favicon and icons - Updated for better browser support
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/synergies4_logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/synergies4_logo.svg", type: "image/svg+xml" }
    ],
    shortcut: "/favicon.svg"
  },
  
  // Open Graph / Facebook - Removed specific image to use defaults
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://synergies4.com",
    siteName: "Synergies4",
    title: "Synergies4 - AI-Powered Learning Platform",
    description: "Transform your career with AI-powered learning. Master Agile, leadership, and mental fitness with expert-led training programs."
  },
  
  // Twitter - Removed specific image to use defaults
  twitter: {
    card: "summary",
    site: "@synergies4",
    creator: "@synergies4",
    title: "Synergies4 - AI-Powered Learning Platform",
    description: "Transform your career with AI-powered learning. Master Agile, leadership, and mental fitness with expert-led training programs."
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
      <head>
        {/* Additional favicon links for better browser support */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <PerformanceOptimizer />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
