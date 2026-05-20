"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useChainId, useReadContract } from "wagmi";
import { SOKO_SCAN_ADDRESS, SOKO_SCAN_ABI } from "@/lib/contracts";
import CustomerView from "@/components/CustomerView";

function PayPage() {
  const params = useSearchParams();
  const merchant = params.get("merchant");
  const chainId = useChainId() as 42220 | 44787;
  const contractAddress = SOKO_SCAN_ADDRESS[chainId];
  const mId = merchant ? BigInt(merchant) : undefined;
  const { data: merchantData } = useReadContract({ address: contractAddress, abi: SOKO_SCAN_ABI, functionName: "getMerchant", args: mId !== undefined ? [mId] : undefined });
  return (
    <div className="min-h-screen max-w-md mx-auto px-4 pt-6 pb-8">
      <h1 className="text-2xl font-bold text-amber-700 mb-0.5">SokoScan</h1>
      {merchantData
        ? <p className="text-sm text-gray-600 mb-5">Paying <span className="font-medium text-amber-700">{merchantData.name}</span></p>
        : <p className="text-xs text-gray-400 mb-5">Merchant #{merchant}</p>}
      <CustomerView />
      <p className="text-center text-xs text-gray-300 mt-8">Powered by Celo</p>
    </div>
  );
}
export default function Page() { return <Suspense><PayPage /></Suspense>; }
