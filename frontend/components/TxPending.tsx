"use client";

interface Props {
  hash?: `0x${string}`;
  label?: string;
}

export default function TxPending({ hash, label = "Transaction pending..." }: Props) {
  const explorerBase = "https://celoscan.io/tx/";
  return (
    <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2 text-xs text-amber-700">
      <span className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0" />
      <span>{label}</span>
      {hash && (
        <a href={`${explorerBase}${hash}`} target="_blank" rel="noopener noreferrer" className="ml-auto text-amber-500 underline shrink-0">View ↗</a>
      )}
    </div>
  );
}
