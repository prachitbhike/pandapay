import { http, createConfig } from "wagmi";
import { baseSepolia, hardhat } from "wagmi/chains";

// Create wagmi config for Privy
export const config = createConfig({
  chains: [baseSepolia, hardhat],
  transports: {
    [baseSepolia.id]: http(),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
});

// Get the current chain based on environment
export function getCurrentChain() {
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 84532;
  if (chainId === 31337) return hardhat;
  return baseSepolia;
}

// Export chains for Privy
export const supportedChains = [baseSepolia, hardhat];
