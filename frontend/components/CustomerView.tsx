"use client";
import { useState } from "react";
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { useSearchParams } from "next/navigation";
import { SOKO_SCAN_ADDRESS, SOKO_SCAN_ABI, CUSD_ADDRESS, ERC20_ABI } from "@/lib/contracts";
import { categoryIcon } from "@/lib/categories";
export default function CustomerView() {
  const { address } = useAccount();
  const chainId = useChainId() as 42220|44787;
  const contractAddress = SOKO_SCAN_ADDRESS[chainId];
  const cUSD = CUSD_ADDRESS[chainId] as `0x${string}`;
  const params = useSearchParams();
  const [merchantId,setMerchantId]=useState(params?.get("merchant")??"");
  const [amount,setAmount]=useState("");
  const [pointsToRedeem,setPointsToRedeem]=useState("0");
  const mId = merchantId ? BigInt(merchantId) : undefined;
  const { data: merchant } = useReadContract({ address: contractAddress, abi: SOKO_SCAN_ABI, functionName: "getMerchant", args: mId !== undefined ? [mId] : undefined });
  const { data: myPoints } = useReadContract({ address: contractAddress, abi: SOKO_SCAN_ABI, functionName: "getCustomerPoints", args: address && mId !== undefined ? [address,mId] : undefined });
  const { data: balance } = useReadContract({ address: cUSD, abi: ERC20_ABI, functionName: "balanceOf", args: address ? [address] : undefined });
  const { data: allowance } = useReadContract({ address: cUSD, abi: ERC20_ABI, functionName: "allowance", args: address && contractAddress ? [address,contractAddress] : undefined });
  const { writeContract: approve, data: approveTx } = useWriteContract();
  const { writeContract: pay, data: payTx } = useWriteContract();
  const { isSuccess: approveOk } = useWaitForTransactionReceipt({ hash: approveTx });
  const { isSuccess: payOk } = useWaitForTransactionReceipt({ hash: payTx });
  const parsedAmount = amount ? parseUnits(amount,18) : 0n;
  const discount = BigInt(pointsToRedeem) * BigInt(1e15);
  const finalAmount = parsedAmount > discount ? parsedAmount - discount : 0n;
  const pointsEarned = merchant ? (Number(amount||0)*Number(merchant.pointsPerCUSD)) : 0;
  function executePay() { if (!contractAddress||!mId) return; pay({ address:contractAddress, abi:SOKO_SCAN_ABI, functionName:"pay", args:[mId,parsedAmount,BigInt(pointsToRedeem)] }); }
  function handlePay() { if (!contractAddress||!mId) return; if (!allowance||allowance<parsedAmount) { approve({ address:cUSD, abi:ERC20_ABI, functionName:"approve", args:[contractAddress,parsedAmount] }); } else { executePay(); } }
  if (approveOk) executePay();
  if (payOk) return (
    <div className="bg-white rounded-2xl p-6 text-center shadow-sm space-y-2">
      <p className="text-4xl">✓</p>
      <p className="font-semibold text-amber-700 text-lg">Payment sent!</p>
      <p className="text-xs text-gray-500">You earned <span className="font-medium text-amber-600">{pointsEarned} SokoPoints</span> at {merchant?.name}.</p>
      <p className="text-xs text-gray-400">1 SokoPoint = 0.001 cUSD off your next purchase.</p>
    </div>
  );
  return (
    <div className="space-y-4"><div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      <div><label className="block text-xs font-medium text-gray-600 mb-1">Merchant ID</label><input value={merchantId} onChange={(e)=>setMerchantId(e.target.value)} placeholder="From merchant's QR or link" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
      {merchant&&<div className="bg-amber-50 rounded-xl p-3 flex items-center gap-2"><span className="text-xl">{categoryIcon(merchant.category)}</span><div><p className="font-medium text-amber-800 text-sm">{merchant.name}</p><p className="text-xs text-amber-600">{merchant.category}</p></div></div>}
      <div><label className="block text-xs font-medium text-gray-600 mb-1">Amount (cUSD){balance!==undefined&&` — balance: ${Number(formatUnits(balance,18)).toFixed(2)}`}</label><input value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0.00" type="number" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
      {myPoints!==undefined&&myPoints>0n&&<div><label className="block text-xs font-medium text-gray-600 mb-1">Redeem SokoPoints (you have {myPoints.toString()} pts = {(Number(myPoints)*0.001).toFixed(3)} cUSD)</label><input value={pointsToRedeem} onChange={(e)=>setPointsToRedeem(e.target.value)} placeholder="0" type="number" min="0" max={myPoints.toString()} className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /><p className="text-xs text-gray-400 mt-1">Discount: {Number(formatUnits(discount,18)).toFixed(4)} cUSD</p></div>}
      {parsedAmount>0n&&<div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1"><div className="flex justify-between text-gray-500"><span>You pay</span><span>{Number(formatUnits(finalAmount,18)).toFixed(4)} cUSD</span></div><div className="flex justify-between text-amber-600 font-medium"><span>Points earned</span><span>+{pointsEarned} SokoPoints</span></div></div>}
      <button onClick={handlePay} disabled={!merchantId||!amount||!contractAddress} className="w-full py-3 bg-amber-600 text-white rounded-xl font-semibold disabled:opacity-50 active:scale-95 transition-transform">Pay Now</button>
    </div></div>
  );
}
