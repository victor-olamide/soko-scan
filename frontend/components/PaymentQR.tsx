"use client";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { SOKO_SCAN_ADDRESS, SOKO_SCAN_ABI } from "@/lib/contracts";
export default function PaymentQR() {
  const { address } = useAccount();
  const chainId = useChainId() as 42220|44787;
  const contractAddress = SOKO_SCAN_ADDRESS[chainId];
  const { data: merchantId } = useReadContract({ address: contractAddress, abi: SOKO_SCAN_ABI, functionName: "merchantIdByWallet", args: address ? [address] : undefined });
  const { data: merchant } = useReadContract({ address: contractAddress, abi: SOKO_SCAN_ABI, functionName: "getMerchant", args: merchantId !== undefined ? [merchantId] : undefined });
  if (!merchant) return null;
  return <div className="bg-white rounded-2xl p-5 shadow-sm text-center" />;
}
