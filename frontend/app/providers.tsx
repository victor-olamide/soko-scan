"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { wagmiConfig } from "@/lib/wagmi";
import { useEffect } from "react";

const queryClient = new QueryClient();

function AutoConnect() {
  const { connect } = useConnect();
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum && (window.ethereum as any).isMiniPay) {
      connect({ connector: injected({ target: "metaMask" }) });
    }
  }, [connect]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AutoConnect />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
