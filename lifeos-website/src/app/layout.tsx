import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#0c0a10",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ascnd.app"),
  title: "Ascnd - Level up your life",
  description: "The gamified life operating system. Track productivity, health, finances, learning and goals — all connected, all gamified. Earn XP, level up your avatar, and watch yourself transform.",
  keywords: ["life operating system", "gamified life tracker", "personal development RPG", "all-in-one life app", "productivity gamification", "self-improvement game", "life management", "AI life assistant", "level up your life"],
  authors: [{ name: "Ascnd" }],
  openGraph: {
    title: "Ascnd - Level up your life",
    description: "Productivity. Health. Finances. Learning. Goals. All connected. All gamified. Finally, an app that makes becoming your best self addictive.",
    url: "https://ascnd.app",
    siteName: "Ascnd",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ascnd - Level up your life",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ascnd - Level up your life",
    description: "Productivity. Health. Finances. Learning. Goals. All connected. All gamified. Level up for real.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://ascnd.app/#website',
      url: 'https://ascnd.app',
      name: 'Ascnd',
      description: 'Level up your life — the gamified life operating system',
      publisher: {
        '@id': 'https://ascnd.app/#organization',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://ascnd.app/#organization',
      name: 'Ascnd',
      url: 'https://ascnd.app',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ascnd.app/logo.svg',
      },
      sameAs: [],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://ascnd.app/#app',
      name: 'Ascnd',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web, iOS, Android',
      description: 'Level up your life. Track productivity, health, finances, learning and goals — all connected, all gamified.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'GBP',
        description: 'Free tier available',
      },
      featureList: [
        '8 connected life modules',
        'Full RPG gamification with XP and levels',
        'AI companion with pattern recognition',
        'Equipment and pet companions',
        'Boss battles and PvP arena',
        'Skill constellation system',
        'Cross-platform sync',
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="canonical" href="https://ascnd.app" />
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Inline script to handle scroll restoration and returning visitor state */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Disable browser scroll restoration - always start at top on refresh
                // This is standard for scroll-driven animation pages with pinned sections
                if ('scrollRestoration' in history) {
                  history.scrollRestoration = 'manual';
                }
                window.scrollTo(0, 0);

                // Show navbar immediately if returning visitor (we're now guaranteed to be at top)
                if (sessionStorage.getItem('ascnd-loading-shown') === 'true') {
                  document.documentElement.classList.add('returning-visitor');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {/* Cosmic Background */}
        <div className="cosmic-bg" aria-hidden="true" />

        {children}
      </body>
    </html>
  );
}
