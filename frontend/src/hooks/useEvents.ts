"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { CONTRACTS, EventFactoryABI, EventABI, EventInfo, CurveType, EventState } from "@/lib/contracts";

export function useAllEvents() {
  return useReadContract({
    address: CONTRACTS.FACTORY as `0x${string}`,
    abi: EventFactoryABI,
    functionName: "getAllEvents",
  });
}

export function useEventCount() {
  return useReadContract({
    address: CONTRACTS.FACTORY as `0x${string}`,
    abi: EventFactoryABI,
    functionName: "getEventCount",
  });
}

export function useEventsByManager(managerAddress: string | undefined) {
  return useReadContract({
    address: CONTRACTS.FACTORY as `0x${string}`,
    abi: EventFactoryABI,
    functionName: "getEventsByManager",
    args: managerAddress ? [managerAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!managerAddress,
    },
  });
}

export function useEventInfo(eventAddress: string | undefined) {
  const { data, ...rest } = useReadContract({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: "getEventInfo",
    query: {
      enabled: !!eventAddress,
    },
  });

  // Transform the tuple response into a typed object
  const eventInfo: EventInfo | undefined = data
    ? {
        name: data[0],
        description: data[1],
        venue: data[2],
        eventDate: data[3],
        imageUrl: data[4],
        maxSupply: data[5],
        ticketsSold: data[6],
        currentPrice: data[7],
        basePrice: data[8],
        curveType: data[9] as CurveType,
        curveParameter: data[10],
        state: data[11] as EventState,
        manager: data[12],
        totalRevenue: data[13],
      }
    : undefined;

  return { data: eventInfo, ...rest };
}

export function useCurrentPrice(eventAddress: string | undefined) {
  return useReadContract({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: "getCurrentPrice",
    query: {
      enabled: !!eventAddress,
      refetchInterval: 5000, // Refresh every 5 seconds
    },
  });
}

export function usePriceRange(
  eventAddress: string | undefined,
  startSupply: bigint,
  count: bigint
) {
  return useReadContract({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: "getPriceRange",
    args: [startSupply, count],
    query: {
      enabled: !!eventAddress,
    },
  });
}

export function useBulkPrice(
  eventAddress: string | undefined,
  count: number
) {
  return useReadContract({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: "getBulkPrice",
    args: [BigInt(count)],
    query: {
      enabled: !!eventAddress && count > 0,
    },
  });
}

export function useHasTicket(
  eventAddress: string | undefined,
  holderAddress: string | undefined
) {
  return useReadContract({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: "hasTicket",
    args: holderAddress ? [holderAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!eventAddress && !!holderAddress,
    },
  });
}

// Hook to get info for multiple events
export function useMultipleEventInfos(eventAddresses: string[]) {
  const contracts = eventAddresses.map((address) => ({
    address: address as `0x${string}`,
    abi: EventABI,
    functionName: "getEventInfo" as const,
  }));

  const { data, ...rest } = useReadContracts({
    contracts,
    query: {
      enabled: eventAddresses.length > 0,
    },
  });

  const eventInfos: (EventInfo | undefined)[] =
    data?.map((result) => {
      if (result.status !== "success" || !result.result) return undefined;
      const r = result.result as readonly [
        string,
        string,
        string,
        bigint,
        string,
        bigint,
        bigint,
        bigint,
        bigint,
        number,
        bigint,
        number,
        string,
        bigint
      ];
      return {
        name: r[0],
        description: r[1],
        venue: r[2],
        eventDate: r[3],
        imageUrl: r[4],
        maxSupply: r[5],
        ticketsSold: r[6],
        currentPrice: r[7],
        basePrice: r[8],
        curveType: r[9] as CurveType,
        curveParameter: r[10],
        state: r[11] as EventState,
        manager: r[12],
        totalRevenue: r[13],
      };
    }) ?? [];

  return { data: eventInfos, ...rest };
}
