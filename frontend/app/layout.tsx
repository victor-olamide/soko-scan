import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "SokoScan", description: "Accept cUSD payments. Reward loyal customers." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
