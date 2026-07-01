import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const gtAlpina = localFont({
  src: [
    {
      path: "../../public/fonts/GTAlpinaLight.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/GTAlpinaLightItalic.woff2",
      weight: "300",
      style: "italic",
    },
  ],
  variable: "--font-gt-alpina",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fabric — the AI workspace that thinks with you",
  description:
    "Think, make, collaborate, and publish. Alongside your own personal AI. A living home for all your projects, ideas, memories, files, & meetings.",
  icons: {
    icon: "/seo/xZVHSFo3pv5mN9ewJpNn4UlHKcU.png",
    apple: "/seo/T7YRHwXka5lty9DPsHt6fbzEctc.png",
  },
  openGraph: {
    title: "Fabric — the AI workspace that thinks with you",
    description:
      "Think, make, collaborate, and publish. Alongside your own personal AI.",
    siteName: "Fabric",
    type: "website",
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
      className={`${inter.variable} ${manrope.variable} ${gtAlpina.variable} antialiased`}
    >
      <body className="bg-white text-black min-h-screen">{children}</body>
    </html>
  );
}
