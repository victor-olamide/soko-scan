"use client";
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits } from "viem";
import { useState } from "react";
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
  const { data: loyaltyRules } = useReadContract({ address: contractAddress, abi: SOKO_SCAN_ABI, functionName: "getLoyaltyRules", args: merchantId !== undefined ? [merchantId] : undefined });
  const [rulePoints, setRulePoints] = useState("");
  const [ruleDiscount, setRuleDiscount] = useState("");
  const { writeContract: addRule, data: ruleTx } = useWriteContract();
  const { isSuccess: ruleAdded } = useWaitForTransactionReceipt({ hash: ruleTx });
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
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <p className="font-semibold text-gray-800 text-sm">Loyalty Rules</p>
        {loyaltyRules && loyaltyRules.length > 0
          ? loyaltyRules.map((r, i) => (
              <div key={i} className="flex justify-between text-xs text-gray-600 bg-amber-50 rounded-xl px-3 py-2">
                <span>{r.pointsRequired.toString()} pts required</span>
                <span>{(Number(r.discountBPS) / 100).toFixed(0)}% discount</span>
              </div>
            ))
          : <p className="text-xs text-gray-400">No loyalty rules yet.</p>}
        {ruleAdded
          ? <p className="text-xs text-amber-600">Rule added!</p>
          : <div className="flex gap-2">
              <input value={rulePoints} onChange={e=>setRulePoints(e.target.value)} placeholder="Points" type="number" className="w-1/2 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500" />
              <input value={ruleDiscount} onChange={e=>setRuleDiscount(e.target.value)} placeholder="Discount %" type="number" min="1" max="100" className="w-1/2 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500" />
              <button onClick={()=>contractAddress&&rulePoints&&ruleDiscount&&addRule({address:contractAddress,abi:SOKO_SCAN_ABI,functionName:"addLoyaltyRule",args:[BigInt(rulePoints),BigInt(Number(ruleDiscount)*100)]})} disabled={!rulePoints||!ruleDiscount} className="py-2 px-3 bg-amber-600 text-white rounded-xl text-xs disabled:opacity-50">Add</button>
            </div>}
      </div>
    </div>
  );
}
