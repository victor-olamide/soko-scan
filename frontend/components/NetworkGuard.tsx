"use client";
import { useChainId } from "wagmi";

const SUPPORTED = [42220, 44787];

export default function NetworkGuard() {
  const chainId = useChainId();
  if (SUPPORTED.includes(chainId)) return null;
  return (
    <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
      Wrong network. Please switch to <strong>Celo Mainnet</strong> or <strong>Alfajores</strong> in your wallet.
    </div>
  );
}
