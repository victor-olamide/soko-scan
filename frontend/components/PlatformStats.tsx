"use client";
import { useEffect, useState, useCallback } from "react";
import { usePublicClient, useChainId } from "wagmi";
import { parseAbiItem, formatUnits } from "viem";
import { SOKO_SCAN_ADDRESS } from "@/lib/contracts";

function Skeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 mb-5">
      {[0, 1, 2].map(i => (
        <div key={i} className="bg-amber-50 rounded-xl p-3 text-center animate-pulse">
          <div className="h-6 bg-amber-100 rounded mb-1 mx-auto w-10" />
          <div className="h-3 bg-amber-100 rounded mx-auto w-14" />
        </div>
      ))}
    </div>
  );
}

export default function PlatformStats() {
  const chainId = useChainId() as 42220 | 44787;
  const client = usePublicClient();
  const address = SOKO_SCAN_ADDRESS[chainId];
  const [stats, setStats] = useState<{ merchants: number; txns: number; volume: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!client || !address) return;
    setLoading(true);
    try {
      const [registered, payments] = await Promise.all([
        client.getLogs({
          address,
          event: parseAbiItem("event MerchantRegistered(uint256 indexed merchantId, address indexed wallet, string name)"),
          fromBlock: 0n,
          toBlock: "latest",
        }),
        client.getLogs({
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
    } catch {
      // stats are non-critical
    } finally {
      setLoading(false);
    }
  }, [client, address]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Skeleton />;
  if (!stats) return null;

  return (
    <div className="mb-5">
      <div className="grid grid-cols-3 gap-2">
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
      <button onClick={load} className="mt-2 w-full text-xs text-gray-400 py-1 hover:text-amber-600 transition-colors">↻ Refresh</button>
    </div>
  );
}
