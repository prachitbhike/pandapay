// Contract addresses by chain ID
export const PAYMENT_ESCROW_ADDRESSES: Record<number, `0x${string}`> = {
  421614: '0x0000000000000000000000000000000000000000', // Arbitrum Sepolia - Update after deployment
  11155420: '0x0000000000000000000000000000000000000000', // Optimism Sepolia - Update after deployment
  42161: '0x0000000000000000000000000000000000000000', // Arbitrum
  10: '0x0000000000000000000000000000000000000000', // Optimism
};

// ETH address constant (used for native ETH payments)
export const ETH_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

// Common stablecoin addresses
export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  421614: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Arbitrum Sepolia USDC
  11155420: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7', // Optimism Sepolia USDC
  42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum USDC
  10: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', // Optimism USDC
};

// Escrow period in seconds (7 days)
export const ESCROW_PERIOD = 7 * 24 * 60 * 60;

// Payment statuses
export enum PaymentStatus {
  PENDING = 'pending',
  CLAIMED = 'claimed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

// Supported token interface
export interface Token {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  name: string;
}

// Get supported tokens for a chain
export function getSupportedTokens(chainId: number): Token[] {
  return [
    {
      address: ETH_ADDRESS,
      symbol: 'ETH',
      decimals: 18,
      name: 'Ethereum',
    },
    {
      address: USDC_ADDRESSES[chainId] || ETH_ADDRESS,
      symbol: 'USDC',
      decimals: 6,
      name: 'USD Coin',
    },
  ];
}
