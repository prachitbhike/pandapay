"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { CONTRACTS, TicketNFTABI, TicketData } from "@/lib/contracts";

export function useTicketsByOwner(ownerAddress: string | undefined) {
  return useReadContract({
    address: CONTRACTS.TICKET_NFT as `0x${string}`,
    abi: TicketNFTABI,
    functionName: "getTicketsByOwner",
    args: ownerAddress ? [ownerAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!ownerAddress,
    },
  });
}

export function useTicketData(tokenId: bigint | undefined) {
  const { data, ...rest } = useReadContract({
    address: CONTRACTS.TICKET_NFT as `0x${string}`,
    abi: TicketNFTABI,
    functionName: "getTicketData",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined,
    },
  });

  const ticketData: TicketData | undefined = data
    ? {
        eventContract: data.eventContract,
        eventName: data.eventName,
        eventDate: data.eventDate,
        venue: data.venue,
        purchasePrice: data.purchasePrice,
        purchaseTimestamp: data.purchaseTimestamp,
        ticketNumber: data.ticketNumber,
      }
    : undefined;

  return { data: ticketData, ...rest };
}

export function useMultipleTicketData(tokenIds: bigint[]) {
  const contracts = tokenIds.map((tokenId) => ({
    address: CONTRACTS.TICKET_NFT as `0x${string}`,
    abi: TicketNFTABI,
    functionName: "getTicketData" as const,
    args: [tokenId],
  }));

  const { data, ...rest } = useReadContracts({
    contracts,
    query: {
      enabled: tokenIds.length > 0,
    },
  });

  const ticketDataList: (TicketData | undefined)[] =
    data?.map((result) => {
      if (result.status !== "success" || !result.result) return undefined;
      const r = result.result as {
        eventContract: string;
        eventName: string;
        eventDate: bigint;
        venue: string;
        purchasePrice: bigint;
        purchaseTimestamp: bigint;
        ticketNumber: bigint;
      };
      return {
        eventContract: r.eventContract,
        eventName: r.eventName,
        eventDate: r.eventDate,
        venue: r.venue,
        purchasePrice: r.purchasePrice,
        purchaseTimestamp: r.purchaseTimestamp,
        ticketNumber: r.ticketNumber,
      };
    }) ?? [];

  return { data: ticketDataList, ...rest };
}

export function useTicketBalance(ownerAddress: string | undefined) {
  return useReadContract({
    address: CONTRACTS.TICKET_NFT as `0x${string}`,
    abi: TicketNFTABI,
    functionName: "balanceOf",
    args: ownerAddress ? [ownerAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!ownerAddress,
    },
  });
}
