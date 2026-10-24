import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Finpulse • Smart Daily Budgeting & Real-Time Banking for India",
  description:
    "Convert your monthly salary into a real-time daily spending allowance. Auto-categorize UPI & bank statements, curb Zepto/Blinkit impulse leaks, and receive your 9 PM financial verdict.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Finpulse",
  },
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  keywords: [
    "personal finance India",
    "daily budget calculator",
    "UPI expense tracker",
    "Blinkit Zepto tracker",
    "young professionals budgeting",
    "Finpulse",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080c14] text-gray-100">{children}</body>
    </html>
  );
}
