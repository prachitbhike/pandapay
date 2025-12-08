import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEther, parseEther } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(priceWei: bigint): string {
  const eth = formatEther(priceWei);
  const num = parseFloat(eth);

  if (num < 0.0001) {
    return `${(num * 1e6).toFixed(2)} µETH`;
  }
  if (num < 0.01) {
    return `${(num * 1000).toFixed(3)} mETH`;
  }
  return `${num.toFixed(4)} ETH`;
}

export function formatPriceShort(priceWei: bigint): string {
  const eth = formatEther(priceWei);
  const num = parseFloat(eth);
  return `${num.toFixed(4)}`;
}

export function formatDate(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getTimeUntil(timestamp: bigint | number): string {
  const now = Date.now() / 1000;
  const target = Number(timestamp);
  const diff = target - now;

  if (diff < 0) {
    return "Event has passed";
  }

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function calculatePercentageSold(sold: bigint, max: bigint): number {
  if (max === 0n) return 0;
  return Number((sold * 100n) / max);
}

export function generateQRData(
  eventAddress: string,
  tokenId: bigint,
  ownerAddress: string
): string {
  // Generate a unique verification string for the ticket
  return JSON.stringify({
    event: eventAddress,
    ticket: tokenId.toString(),
    owner: ownerAddress,
    timestamp: Date.now(),
  });
}
