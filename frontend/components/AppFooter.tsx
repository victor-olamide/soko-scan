"use client";
import { useChainId } from "wagmi";
import { SOKO_SCAN_ADDRESS, SOKO_POINTS_ADDRESS } from "@/lib/contracts";

export default function AppFooter() {
  const chainId = useChainId() as 42220 | 44787;
  const scanBase = chainId === 42220 ? "https://celoscan.io" : "https://alfajores.celoscan.io";
  return (
    <footer className="mt-10 pb-6 text-center space-y-1">
      <p className="text-xs text-gray-300">Powered by Celo</p>
      <div className="flex justify-center gap-3 text-xs text-gray-300">
        <a href={`${scanBase}/address/${SOKO_SCAN_ADDRESS[chainId]}`} target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">SokoScan contract</a>
        <span>·</span>
        <a href={`${scanBase}/address/${SOKO_POINTS_ADDRESS[chainId]}`} target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">SokoPoints token</a>
      </div>
    </footer>
  );
}
