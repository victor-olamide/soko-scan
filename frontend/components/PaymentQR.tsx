"use client";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { useState } from "react";
import { SOKO_SCAN_ADDRESS, SOKO_SCAN_ABI } from "@/lib/contracts";
import { categoryIcon } from "@/lib/categories";
export default function PaymentQR() {
  const { address } = useAccount();
  const chainId = useChainId() as 42220|44787;
  const contractAddress = SOKO_SCAN_ADDRESS[chainId];
  const [copied, setCopied] = useState(false);
  const { data: merchantId } = useReadContract({ address: contractAddress, abi: SOKO_SCAN_ABI, functionName: "merchantIdByWallet", args: address ? [address] : undefined });
  const { data: merchant } = useReadContract({ address: contractAddress, abi: SOKO_SCAN_ABI, functionName: "getMerchant", args: merchantId !== undefined ? [merchantId] : undefined });
  if (!merchant) return null;
  const payUrl = typeof window !== "undefined" ? `${window.location.origin}/pay?merchant=${merchantId}` : "";
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payUrl)}`;
  function copyLink() { navigator.clipboard.writeText(payUrl); setCopied(true); setTimeout(()=>setCopied(false),2000); }
  function shareLink() { if (navigator.share) { navigator.share({ title: merchant?.name, text: `Pay ${merchant?.name} with cUSD`, url: payUrl }); } else { copyLink(); } }
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
      <p className="font-semibold text-gray-800 mb-1">{categoryIcon(merchant.category)} {merchant.name}</p>
      <p className="text-xs text-amber-600 mb-4">{merchant.category}</p>
      <div className="flex justify-center mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrSrc} alt="Payment QR" className="rounded-xl w-48 h-48" />
      </div>
      <p className="text-xs text-gray-400 mb-1">Merchant ID: <span className="font-mono text-gray-600">#{merchantId?.toString()}</span></p>
      <p className="text-xs text-gray-400 mb-3">Customer scans to pay. They earn {merchant.pointsPerCUSD.toString()} SokoPoints per cUSD.</p>
      <div className="flex gap-2">
        <button onClick={copyLink} className="flex-1 py-2.5 border border-amber-500 text-amber-700 rounded-xl text-sm font-medium">{copied?"Copied!":"Copy link"}</button>
        <button onClick={shareLink} className="py-2.5 px-3 bg-amber-600 text-white rounded-xl text-sm">Share</button>
        <a href={`https://celoscan.io/address/${merchant.wallet}`} target="_blank" rel="noopener noreferrer" className="py-2.5 px-3 border border-gray-200 text-gray-500 rounded-xl text-sm">↗</a>
      </div>
    </div>
  );
}
