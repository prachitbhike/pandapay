"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { Minus, Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { EventABI } from "@/lib/contracts";
import { useCurrentPrice, useBulkPrice } from "@/hooks/useEvents";
import { formatPrice } from "@/lib/utils";

interface BuyTicketProps {
  eventAddress: string;
  remainingTickets: bigint;
  onSuccess?: () => void;
}

export function BuyTicket({
  eventAddress,
  remainingTickets,
  onSuccess,
}: BuyTicketProps) {
  const [quantity, setQuantity] = useState(1);
  const { login, authenticated } = usePrivy();
  const { address, isConnected } = useAccount();

  const { data: currentPrice, refetch: refetchPrice } = useCurrentPrice(eventAddress);
  const { data: bulkPrice } = useBulkPrice(eventAddress, quantity);

  const {
    data: hash,
    writeContract,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Reset and refetch after successful purchase
  useEffect(() => {
    if (isSuccess) {
      refetchPrice();
      setQuantity(1);
      onSuccess?.();
    }
  }, [isSuccess, refetchPrice, onSuccess]);

  const maxQuantity = Math.min(10, Number(remainingTickets));
  const isSoldOut = remainingTickets === 0n;

  const handleBuy = async () => {
    if (!isConnected || !bulkPrice) return;

    reset();

    if (quantity === 1) {
      writeContract({
        address: eventAddress as `0x${string}`,
        abi: EventABI,
        functionName: "buyTicket",
        value: bulkPrice,
      });
    } else {
      writeContract({
        address: eventAddress as `0x${string}`,
        abi: EventABI,
        functionName: "buyTickets",
        args: [BigInt(quantity)],
        value: bulkPrice,
      });
    }
  };

  if (isSoldOut) {
    return (
      <div className="card bg-red-500/10 border-red-500/20">
        <div className="text-center">
          <span className="text-4xl mb-2 block">😢</span>
          <h3 className="text-lg font-semibold text-red-400">Sold Out</h3>
          <p className="text-sm text-gray-400 mt-1">
            All tickets have been purchased
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card space-y-6">
      <div className="text-center">
        <div className="text-sm text-gray-400 mb-1">Current Price</div>
        <div className="text-3xl font-bold gradient-text">
          {currentPrice ? formatPrice(currentPrice) : "—"}
        </div>
      </div>

      {/* Quantity selector */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          className="btn-secondary p-3 disabled:opacity-50"
        >
          <Minus className="w-5 h-5" />
        </button>
        <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
        <button
          onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
          disabled={quantity >= maxQuantity}
          className="btn-secondary p-3 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Total price */}
      {quantity > 1 && bulkPrice && (
        <div className="text-center">
          <div className="text-sm text-gray-400">Total for {quantity} tickets</div>
          <div className="text-xl font-semibold text-white">
            {formatPrice(bulkPrice)}
          </div>
        </div>
      )}

      {/* Buy button */}
      {!authenticated ? (
        <button onClick={login} className="btn-primary w-full">
          Connect to Buy
        </button>
      ) : (
        <button
          onClick={handleBuy}
          disabled={isPending || isConfirming || !bulkPrice}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isPending || isConfirming ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isPending ? "Confirm in wallet..." : "Processing..."}
            </>
          ) : (
            `Buy ${quantity} Ticket${quantity > 1 ? "s" : ""}`
          )}
        </button>
      )}

      {/* Success message */}
      {isSuccess && (
        <div className="flex items-center gap-2 text-primary-400 bg-primary-500/10 rounded-xl p-4">
          <CheckCircle className="w-5 h-5" />
          <span>Purchase successful! Check your profile for your ticket.</span>
        </div>
      )}

      {/* Error message */}
      {writeError && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 rounded-xl p-4">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">
            {writeError.message.includes("User rejected")
              ? "Transaction cancelled"
              : "Transaction failed. Please try again."}
          </span>
        </div>
      )}

      {/* Remaining tickets */}
      <div className="text-center text-sm text-gray-400">
        {remainingTickets.toString()} tickets remaining
      </div>
    </div>
  );
}
