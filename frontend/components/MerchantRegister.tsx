"use client";
import { useState } from "react";
import { useChainId, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { SOKO_SCAN_ADDRESS, SOKO_SCAN_ABI } from "@/lib/contracts";
const CATEGORIES = ["Food & Drinks","Clothing","Electronics","Services","Groceries","Other"];
export default function MerchantRegister() {
  const chainId = useChainId() as 42220|44787;
  const contractAddress = SOKO_SCAN_ADDRESS[chainId];
  const [name,setName]=useState("");
  const [category,setCategory]=useState(CATEGORIES[0]);
  const [points,setPoints]=useState("10");
  const { writeContract, data: tx, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: tx });
  if (isSuccess) return <div className="bg-white rounded-2xl p-6 text-center shadow-sm"><p className="text-3xl mb-2">✓</p><p className="text-amber-700 font-semibold text-lg">Merchant registered!</p><p className="text-xs text-gray-400 mt-1">Reload to see your QR code and dashboard.</p></div>;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
      <p className="font-semibold text-gray-800">Register your business</p>
      <div><label className="block text-xs font-medium text-gray-600 mb-1">Business name</label><input value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. Mama Amara's Kitchen" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
      <div><label className="block text-xs font-medium text-gray-600 mb-1">Category</label><select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">{CATEGORIES.map((cat)=><option key={cat}>{cat}</option>)}</select></div>
      <div><label className="block text-xs font-medium text-gray-600 mb-1">Points per cUSD spent</label><input value={points} onChange={(e)=>setPoints(e.target.value)} type="number" min="1" max="100" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /><p className="text-xs text-gray-400 mt-1">Customer earns {points} SokoPoints per 1 cUSD paid to you.</p></div>
      <button onClick={()=>contractAddress&&writeContract({address:contractAddress,abi:SOKO_SCAN_ABI,functionName:"registerMerchant",args:[name,category,BigInt(points)]})} disabled={!name||isPending||!contractAddress} className="w-full py-3 bg-amber-600 text-white rounded-xl font-semibold disabled:opacity-50">{isPending?"Registering...":"Register Business"}</button>
    </div>
  );
}
