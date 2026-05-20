import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
