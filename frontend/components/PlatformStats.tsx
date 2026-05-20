"use client";
import { useEffect, useState } from "react";
import { usePublicClient, useChainId } from "wagmi";
import { parseAbiItem, formatUnits } from "viem";
import { SOKO_SCAN_ADDRESS } from "@/lib/contracts";

export default function PlatformStats() {
  const chainId = useChainId() as 42220 | 44787;
  const client = usePublicClient();
  const address = SOKO_SCAN_ADDRESS[chainId];
  const [stats, setStats] = useState<{ merchants: number; txns: number; volume: string } | null>(null);

  useEffect(() => {
    if (!client || !address) return;
    async function load() {
      const [registered, payments] = await Promise.all([
        client!.getLogs({
          address,
          event: parseAbiItem("event MerchantRegistered(uint256 indexed merchantId, address indexed wallet, string name)"),
          fromBlock: 0n,
          toBlock: "latest",
        }),
        client!.getLogs({
          address,
          event: parseAbiItem("event PaymentReceived(uint256 indexed merchantId, address indexed customer, uint256 amount, uint256 pointsIssued)"),
          fromBlock: 0n,
          toBlock: "latest",
        }),
      ]);
      const totalVolume = payments.reduce((acc, log) => acc + ((log.args as { amount?: bigint }).amount ?? 0n), 0n);
      setStats({
        merchants: registered.length,
        txns: payments.length,
        volume: Number(formatUnits(totalVolume, 18)).toFixed(2),
      });
    }
    load().catch(() => {});
  }, [client, address]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-3 gap-2 mb-5">
      {[
        { label: "Merchants", value: stats.merchants },
        { label: "Payments", value: stats.txns },
        { label: "cUSD Volume", value: stats.volume },
      ].map(({ label, value }) => (
        <div key={label} className="bg-amber-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-amber-700">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      ))}
    </div>
  );
}
