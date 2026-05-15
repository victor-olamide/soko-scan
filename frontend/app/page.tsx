"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
type Mode = "merchant"|"customer";
export default function Home() {
  const { isConnected } = useAccount();
  const [mode, setMode] = useState<Mode>("merchant");
  if (!isConnected) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400 text-sm">Opening in MiniPay...</p></div>;
  return (
    <div className="min-h-screen max-w-md mx-auto px-4 pb-8">
      <header className="pt-6 pb-4"><h1 className="text-2xl font-bold text-amber-700">SokoScan</h1><p className="text-xs text-gray-400">Merchant payments + loyalty on Celo</p></header>
      <div className="flex bg-white rounded-xl p-1 shadow-sm mb-5 gap-1">
        {(["merchant","customer"] as Mode[]).map((m)=>(<button key={m} onClick={()=>setMode(m)} className={`flex-1 py-2 text-xs font-medium rounded-lg capitalize transition-colors ${mode===m?"bg-amber-600 text-white":"text-gray-500"}`}>{m==="merchant"?"I'm a Merchant":"I'm a Customer"}</button>))}
      </div>
    </div>
  );
}
