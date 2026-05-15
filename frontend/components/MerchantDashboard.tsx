"use client";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { SOKO_SCAN_ADDRESS, SOKO_SCAN_ABI } from "@/lib/contracts";
export default function MerchantDashboard() {
  const { address } = useAccount();
  const chainId = useChainId() as 42220|44787;
  const { data: merchantId } = useReadContract({ address: SOKO_SCAN_ADDRESS[chainId], abi: SOKO_SCAN_ABI, functionName: "merchantIdByWallet", args: address ? [address] : undefined });
  return <div className="space-y-3" />;
}
