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
  themeColor: "#08090e",
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
      { url: "/brand/battlexa-emblem.png?v=3", sizes: "any", type: "image/png" },
      { url: "/favicon-32x32.png?v=3", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png?v=3", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico?v=3", sizes: "any" },
    ],
    shortcut: "/brand/battlexa-emblem.png?v=3",
    apple: [
      { url: "/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "BATTLEXA",
    statusBarStyle: "black-translucent",
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  localStorage.removeItem('battlexa_theme');
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
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
