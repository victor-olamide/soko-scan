"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
function PayPage() {
  const params = useSearchParams();
  const merchant = params.get("merchant");
  return <div className="min-h-screen max-w-md mx-auto px-4 pt-6 pb-8"><h1 className="text-2xl font-bold text-amber-700 mb-1">SokoScan</h1><p className="text-xs text-gray-400 mb-5">Paying merchant #{merchant}</p></div>;
}
export default function Page() { return <Suspense><PayPage /></Suspense>; }
