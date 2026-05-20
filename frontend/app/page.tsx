"use client";
import { useState } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { SOKO_SCAN_ADDRESS, SOKO_SCAN_ABI } from "@/lib/contracts";
import MerchantDashboard from "@/components/MerchantDashboard";
import MerchantRegister from "@/components/MerchantRegister";
import PaymentQR from "@/components/PaymentQR";
import CustomerView from "@/components/CustomerView";
import PlatformStats from "@/components/PlatformStats";
import NetworkGuard from "@/components/NetworkGuard";
import AppFooter from "@/components/AppFooter";
import { truncateAddress } from "@/lib/format";
type Mode = "merchant"|"customer";

function Landing() {
  return (
    <div className="min-h-screen max-w-md mx-auto px-6 flex flex-col justify-between py-12">
      <div>
        <h1 className="text-3xl font-bold text-amber-700 mb-1">SokoScan</h1>
        <p className="text-sm text-gray-500 mb-8">Accept payments. Reward loyal customers.</p>
        <div className="space-y-4">
          {[
            { icon: "📲", title: "QR code in 60 seconds", desc: "Register your business and get a scannable QR code instantly — no bank account needed." },
            { icon: "💵", title: "Get paid in cUSD", desc: "Customers scan and pay directly in cUSD. Funds hit your wallet immediately." },
            { icon: "⭐", title: "Automatic loyalty points", desc: "Every payment earns SokoPoints. Customers redeem them for discounts on their next visit." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-4 bg-white rounded-2xl p-4 shadow-sm">
              <span className="text-2xl">{icon}</span>
              <div><p className="font-semibold text-gray-800 text-sm mb-0.5">{title}</p><p className="text-xs text-gray-500 leading-relaxed">{desc}</p></div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-10">Open this app inside MiniPay to get started.</p>
    </div>
  );
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId() as 42220|44787;
  const contractAddress = SOKO_SCAN_ADDRESS[chainId];
  const [mode, setMode] = useState<Mode>("merchant");
  const { data: isMerchant, isLoading } = useReadContract({ address: contractAddress, abi: SOKO_SCAN_ABI, functionName: "isMerchant", args: address ? [address] : undefined });
  if (!isConnected) return <Landing />;
  return (
    <div className="min-h-screen max-w-md mx-auto px-4 pb-8">
      <NetworkGuard />
      <header className="pt-6 pb-4 flex items-start justify-between"><div><h1 className="text-2xl font-bold text-amber-700">SokoScan</h1><p className="text-xs text-gray-400">Merchant payments + loyalty on Celo</p></div>{address&&<span className="text-xs text-gray-400 font-mono mt-1">{truncateAddress(address)}</span>}</header>
      <PlatformStats />
      <div className="flex bg-white rounded-xl p-1 shadow-sm mb-5 gap-1">{(["merchant","customer"] as Mode[]).map((m)=>(<button key={m} onClick={()=>setMode(m)} className={`flex-1 py-2 text-xs font-medium rounded-lg capitalize transition-colors ${mode===m?"bg-amber-600 text-white":"text-gray-500"}`}>{m==="merchant"?"I'm a Merchant":"I'm a Customer"}</button>))}</div>
      {mode==="merchant" && !isLoading && (<>{isMerchant ? (<><PaymentQR /><div className="mt-4"><MerchantDashboard /></div></>) : <MerchantRegister />}</>)}
      {mode==="customer" && <CustomerView />}
      <AppFooter />
    </div>
  );
}
