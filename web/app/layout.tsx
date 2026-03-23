import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Sans, Roboto_Mono, Sora, Space_Grotesk } from "next/font/google";
import { Suspense } from "react";

import { AnalyticsBridge } from "@/components/site/analytics-bridge";
import { Footer } from "@/components/site/footer";
import { Navigation } from "@/components/site/navigation";
import { env } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";

import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: `${siteConfig.name} | Future Traffic Intelligence`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "traffic intelligence",
    "traffic forecasting",
    "signal optimization",
    "route planning",
    "smart city analytics",
  ],
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    url: env.NEXT_PUBLIC_SITE_URL,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${instrumentSans.variable} ${sora.variable} ${ibmPlexMono.variable} ${spaceGrotesk.variable} ${robotoMono.variable}`}
      >
        <div className="relative min-h-screen bg-white">
          <div className="site-grid pointer-events-none absolute inset-0" />
          <Navigation />
          <Suspense fallback={null}>
            <AnalyticsBridge />
          </Suspense>
          <main>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
