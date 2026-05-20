"use client";
import { useAccount, useChainId, useReadContract, useWriteContract } from "wagmi";
import { formatUnits } from "viem";
import { SOKO_SCAN_ADDRESS, SOKO_SCAN_ABI } from "@/lib/contracts";
function StatCard({ label, value }: { label: string; value: string }) {
  return <div className="bg-white rounded-2xl p-4 shadow-sm"><p className="text-xs text-gray-400 mb-1">{label}</p><p className="font-bold text-gray-800 text-sm">{value}</p></div>;
}
export default function MerchantDashboard() {
  const { address } = useAccount();
  const chainId = useChainId() as 42220|44787;
  const contractAddress = SOKO_SCAN_ADDRESS[chainId];
  const { data: merchantId } = useReadContract({ address: contractAddress, abi: SOKO_SCAN_ABI, functionName: "merchantIdByWallet", args: address ? [address] : undefined });
  const { data: merchant } = useReadContract({ address: contractAddress, abi: SOKO_SCAN_ABI, functionName: "getMerchant", args: merchantId !== undefined ? [merchantId] : undefined });
  if (!merchant) return null;
  const totalCUSD = Number(formatUnits(merchant.totalReceived, 18)).toFixed(2);
  const txCount = Number(merchant.txCount);
  const avgTx = txCount > 0 ? (Number(formatUnits(merchant.totalReceived, 18)) / txCount).toFixed(2) : "0.00";
  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-gray-800">Sales Overview</h2>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total earned" value={`${totalCUSD} cUSD`} />
        <StatCard label="Transactions" value={merchant.txCount.toString()} />
        <StatCard label="Avg transaction" value={`${avgTx} cUSD`} />
        <StatCard label="Points rate" value={`${merchant.pointsPerCUSD} pts/cUSD`} />
        <StatCard label="Status" value={merchant.active ? "Active" : "Inactive"} />
        <StatCard label="Merchant ID" value={`#${merchantId?.toString()}`} />
      </div>
    </div>
  );
}
