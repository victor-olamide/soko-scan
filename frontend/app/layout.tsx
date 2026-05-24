import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "SokoScan — Merchant payments & loyalty on Celo",
  description: "Accept cUSD payments via QR code in 60 seconds. Automatically reward loyal customers with SokoPoints. Built for informal traders on MiniPay.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "SokoScan",
    description: "Accept cUSD payments. Reward loyal customers.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SokoScan",
    description: "Accept cUSD payments. Reward loyal customers.",
  },
  applicationName: "SokoScan",
  keywords: ["celo", "minipay", "payments", "loyalty", "cusd", "merchant"],
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "SokoScan" },
  other: {
    "talentapp:project_verification": "f61bcae099afaa69e984101083156d6578b63ed7e383c3a2859b7b5547d35b873fec316903973da898af515b7d4940636d8384c8cbdb9126a20ed01624b2aab1",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
