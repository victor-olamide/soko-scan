"use client";
import { useState } from "react";
export default function CustomerView() {
  const [merchantId,setMerchantId]=useState("");
  return (<div className="space-y-4"><div className="bg-white rounded-2xl p-4 shadow-sm"><label className="block text-xs font-medium text-gray-600 mb-1">Merchant ID</label><input value={merchantId} onChange={(e)=>setMerchantId(e.target.value)} placeholder="From merchant's QR or link" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div></div>);
}
