import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";

import { AppProviders } from "@/providers";
import "./globals.css";

// Functional voice — UI, navigation, controls.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Editorial voice — memory, dates, greetings, AI summaries.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Recall — your second brain that actually remembers",
    template: "%s · Recall",
  },
  description:
    "Recall is your AI Memory Operating System. Return to your memories — and let AI help you remember.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${newsreader.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
