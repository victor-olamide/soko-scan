"use client";
import { useState } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { SOKO_SCAN_ADDRESS, SOKO_SCAN_ABI } from "@/lib/contracts";
import MerchantDashboard from "@/components/MerchantDashboard";
import MerchantRegister from "@/components/MerchantRegister";
import PaymentQR from "@/components/PaymentQR";
import CustomerView from "@/components/CustomerView";
type Mode = "merchant"|"customer";
export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId() as 42220|44787;
  const contractAddress = SOKO_SCAN_ADDRESS[chainId];
  const [mode, setMode] = useState<Mode>("merchant");
  const { data: isMerchant } = useReadContract({ address: contractAddress, abi: SOKO_SCAN_ABI, functionName: "isMerchant", args: address ? [address] : undefined });
  if (!isConnected) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400 text-sm">Opening in MiniPay...</p></div>;
  return (
    <div className="min-h-screen max-w-md mx-auto px-4 pb-8">
      <header className="pt-6 pb-4"><h1 className="text-2xl font-bold text-amber-700">SokoScan</h1><p className="text-xs text-gray-400">Merchant payments + loyalty on Celo</p></header>
      <div className="flex bg-white rounded-xl p-1 shadow-sm mb-5 gap-1">{(["merchant","customer"] as Mode[]).map((m)=>(<button key={m} onClick={()=>setMode(m)} className={`flex-1 py-2 text-xs font-medium rounded-lg capitalize transition-colors ${mode===m?"bg-amber-600 text-white":"text-gray-500"}`}>{m==="merchant"?"I'm a Merchant":"I'm a Customer"}</button>))}</div>
      {mode==="merchant" && (<>{isMerchant ? (<><PaymentQR /><div className="mt-4"><MerchantDashboard /></div></>) : <MerchantRegister />}</>)}
      {mode==="customer" && <CustomerView />}
    </div>
  );
}
