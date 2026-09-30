import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#08090E",
};

export const metadata: Metadata = {
  title: "BATTLEXA | Esports Tournament Platform for Free Fire MAX & BGMI",
  description:
    "Compete in premier Free Fire MAX and BGMI tournaments, daily scrims, and esports cups. Secure slot registration, timed room credentials, fair play rules, and instant wallet prize payouts.",
  keywords: [
    "Battlexa",
    "Free Fire MAX Tournament",
    "BGMI Esports",
    "BGMI Tournament App",
    "Esports Platform India",
    "Free Fire Custom Room",
    "Battle Royale Scrims",
  ],
  icons: {
    icon: [
      { url: "/logo-icon.png" },
      { url: "/logo-icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/logo-icon.png" },
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#08090e] text-zinc-100 selection:bg-violet-600 selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col mobile-bottom-offset md:pb-0">
          {children}
        </main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}

