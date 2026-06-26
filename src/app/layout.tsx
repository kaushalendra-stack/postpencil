import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/providers";
import { AnimatedCursor } from "@/components/ui/animated-cursor";

import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PostPencil — Share & Learn",
    template: "%s | PostPencil",
  },
  description:
    "PostPencil is a social learning platform where students share educational resources, notes, PDFs, presentations, and study materials.",
  keywords: [
    "educational resources",
    "student notes",
    "PDF sharing",
    "study materials",
    "learning platform",
    "college notes",
    "presentations",
    "question papers",
  ],
  authors: [{ name: "PostPencil" }],
  creator: "PostPencil",
  metadataBase: new URL("https://postpencil.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://postpencil.com",
    siteName: "PostPencil",
    title: "PostPencil — Share & Learn",
    description:
      "A social learning platform where students share educational resources, notes, PDFs, presentations, and study materials.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "PostPencil — Share & Learn",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PostPencil — Share & Learn",
    description:
      "A social learning platform where students share educational resources, notes, PDFs, presentations, and study materials.",
    images: ["/og.png"],
  },
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
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
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
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <AnimatedCursor />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
