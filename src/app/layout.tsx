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
  title: "PostPencil",
  description: "Share your thoughts, connect with others, and discover amazing content.",
  openGraph: {
    title: "PostPencil",
    description: "Share your thoughts, connect with others, and discover amazing content.",
    siteName: "PostPencil",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PostPencil",
    description: "Share your thoughts, connect with others, and discover amazing content.",
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
