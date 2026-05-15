"use client";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { useState } from "react";
import { SOKO_SCAN_ADDRESS, SOKO_SCAN_ABI } from "@/lib/contracts";
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
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
      <p className="font-semibold text-gray-800 mb-1">{merchant.name}</p>
      <p className="text-xs text-amber-600 mb-4">{merchant.category}</p>
      <div className="flex justify-center mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrSrc} alt="Payment QR" className="rounded-xl w-48 h-48" />
      </div>
      <p className="text-xs text-gray-400 mb-3">Customer scans to pay. They earn {merchant.pointsPerCUSD.toString()} SokoPoints per cUSD.</p>
      <button onClick={copyLink} className="w-full py-2.5 border border-amber-500 text-amber-700 rounded-xl text-sm font-medium">{copied?"Copied!":"Copy payment link"}</button>
    </div>
  );
}
