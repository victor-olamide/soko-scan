"use client";
import { useState } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { SOKO_SCAN_ADDRESS, SOKO_SCAN_ABI } from "@/lib/contracts";
export default function CustomerView() {
  const { address } = useAccount();
  const chainId = useChainId() as 42220|44787;
  const contractAddress = SOKO_SCAN_ADDRESS[chainId];
  const [merchantId,setMerchantId]=useState("");
  const [amount,setAmount]=useState("");
  const mId = merchantId ? BigInt(merchantId) : undefined;
  const { data: merchant } = useReadContract({ address: contractAddress, abi: SOKO_SCAN_ABI, functionName: "getMerchant", args: mId !== undefined ? [mId] : undefined });
  return (<div className="space-y-4"><div className="bg-white rounded-2xl p-4 shadow-sm space-y-3"><div><label className="block text-xs font-medium text-gray-600 mb-1">Merchant ID</label><input value={merchantId} onChange={(e)=>setMerchantId(e.target.value)} placeholder="From merchant's QR or link" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>{merchant&&<div className="bg-amber-50 rounded-xl p-3"><p className="font-medium text-amber-800 text-sm">{merchant.name}</p><p className="text-xs text-amber-600">{merchant.category}</p></div>}<div><label className="block text-xs font-medium text-gray-600 mb-1">Amount (cUSD)</label><input value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0.00" type="number" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div></div></div>);
}
