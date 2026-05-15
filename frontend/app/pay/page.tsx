"use client";
import { Suspense } from "react";
function PayPage() { return <div className="min-h-screen max-w-md mx-auto px-4 pt-6 pb-8" />; }
export default function Page() { return <Suspense><PayPage /></Suspense>; }
