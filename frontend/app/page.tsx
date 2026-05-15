"use client";
import { useAccount } from "wagmi";
export default function Home() {
  const { isConnected } = useAccount();
  if (!isConnected) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400 text-sm">Opening in MiniPay...</p></div>;
  return <div className="min-h-screen max-w-md mx-auto px-4 pb-8" />;
}
