import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import AccessibilityMenu from "@/components/AccessibilityMenu";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Home Offer - Transparent Real Estate Offer Marketplace",
  description: "The transparent real estate offer marketplace. Post properties, submit offers, and win homes through clear, fair competition.",
  keywords: "real estate, offers, auctions, home buying, listings, transparent",
  authors: [{ name: "Home Offer" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://homeoffer.pro",
    siteName: "Home Offer",
    title: "Home Offer - Transparent Real Estate Offer Marketplace",
    description: "The transparent real estate offer marketplace for buying and selling homes",
    images: [
      {
        url: "https://homeoffer.pro/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Home Offer - Transparent Real Estate Offer Marketplace",
    description: "The transparent real estate offer marketplace for buying and selling homes",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="color-scheme" content="light" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="shortcut icon" href="/icon.svg" />
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body className="min-h-full flex flex-col">
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <div id="main-content" className="flex-1" tabIndex={-1}>{children}</div>
        <Footer />
        <AccessibilityMenu />
      </body>
    </html>
  );
}
