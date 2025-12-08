"use client";

import { PrivyProvider as PrivyAuthProvider } from "@privy-io/react-auth";
import { WagmiProvider as PrivyWagmiProvider } from "@privy-io/wagmi";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { baseSepolia, hardhat } from "viem/chains";
import { config } from "@/lib/wagmi";

const queryClient = new QueryClient();

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  // During build time or if no Privy ID is set, use standard wagmi without Privy
  if (!PRIVY_APP_ID || PRIVY_APP_ID === "your_privy_app_id_here") {
    return (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    );
  }

  return (
    <PrivyAuthProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#22c55e",
          logo: "https://your-logo-url.com/logo.png",
        },
        loginMethods: ["email", "wallet", "google"],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia, hardhat],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <PrivyWagmiProvider config={config}>{children}</PrivyWagmiProvider>
      </QueryClientProvider>
    </PrivyAuthProvider>
  );
}
