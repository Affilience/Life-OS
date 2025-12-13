import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LifeOS - Your Personal Operating System for Life",
  description: "The all-in-one productivity, health, and personal development platform. Track habits, workouts, finances, journal entries, and more with gamification that makes growth addictive.",
  keywords: ["productivity app", "habit tracker", "fitness tracker", "personal development", "life management", "gamification", "health tracking", "journal app"],
  authors: [{ name: "LifeOS" }],
  openGraph: {
    title: "LifeOS - Your Personal Operating System for Life",
    description: "The all-in-one productivity, health, and personal development platform with gamification.",
    url: "https://lifeos.app",
    siteName: "LifeOS",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LifeOS - Personal Operating System",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LifeOS - Your Personal Operating System for Life",
    description: "Track everything. Level up your life.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: "#0c0a10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {/* Cosmic Background */}
        <div className="cosmic-bg" aria-hidden="true" />

        {children}
      </body>
    </html>
  );
}
