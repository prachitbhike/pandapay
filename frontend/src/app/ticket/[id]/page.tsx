"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Hash,
  Clock,
  Wallet,
  ExternalLink,
  Copy,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { useTicketData } from "@/hooks/useTickets";
import { CONTRACTS } from "@/lib/contracts";
import { formatPrice, formatDate, getTimeUntil, shortenAddress, generateQRData } from "@/lib/utils";

export default function TicketPage() {
  const params = useParams();
  const tokenId = BigInt(params.id as string);
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);

  const { data: ticket, isLoading } = useTicketData(tokenId);

  const copyTicketId = () => {
    navigator.clipboard.writeText(tokenId.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto animate-pulse space-y-6">
        <div className="h-8 w-24 bg-white/5 rounded" />
        <div className="aspect-square bg-white/5 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 bg-white/5 rounded w-3/4" />
          <div className="h-6 bg-white/5 rounded w-1/2" />
          <div className="h-6 bg-white/5 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-20">
        <span className="text-6xl mb-4 block">🔍</span>
        <h1 className="text-2xl font-bold mb-2">Ticket Not Found</h1>
        <p className="text-gray-400 mb-6">
          This ticket doesn&apos;t exist or has been removed.
        </p>
        <Link href="/profile" className="btn-primary inline-block">
          Back to Profile
        </Link>
      </div>
    );
  }

  const eventPassed = Number(ticket.eventDate) * 1000 < Date.now();
  const qrData = address
    ? generateQRData(ticket.eventContract, tokenId, address)
    : "";

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Tickets
      </Link>

      {/* Ticket Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        {/* Header with ticket number */}
        <div className="bg-gradient-to-r from-primary-500/20 to-accent-500/20 -m-6 mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Ticket</div>
              <div className="text-4xl font-bold text-white">
                #{ticket.ticketNumber.toString()}
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm ${
                eventPassed
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-primary-500/20 text-primary-400"
              }`}
            >
              {eventPassed ? "Memory" : "Valid"}
            </div>
          </div>
        </div>

        {/* Event Info */}
        <div className="space-y-4 mb-6">
          <h1 className="text-2xl font-bold">{ticket.eventName}</h1>

          <div className="flex items-center gap-3 text-gray-300">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <div className="font-medium">{formatDate(ticket.eventDate)}</div>
              <div className="text-sm text-gray-400">
                {eventPassed ? "Event has passed" : getTimeUntil(ticket.eventDate)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-300">
            <MapPin className="w-5 h-5 text-gray-400" />
            <span>{ticket.venue}</span>
          </div>
        </div>

        {/* QR Code */}
        {!eventPassed && (
          <div className="bg-white p-4 rounded-2xl mb-6">
            <QRCodeSVG
              value={qrData}
              size={280}
              level="H"
              className="w-full h-auto"
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
        )}

        {eventPassed && (
          <div className="bg-gradient-to-br from-purple-500/10 to-accent-500/10 rounded-2xl p-6 mb-6 text-center">
            <span className="text-4xl mb-2 block">🎉</span>
            <h3 className="font-semibold mb-1">Thanks for attending!</h3>
            <p className="text-sm text-gray-400">
              This ticket is now a collectible memory
            </p>
          </div>
        )}

        {/* Details */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <Hash className="w-4 h-4" />
              <span className="text-sm">Token ID</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">{tokenId.toString()}</span>
              <button
                onClick={copyTicketId}
                className="p-1 rounded hover:bg-white/5 transition-colors"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-primary-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <Wallet className="w-4 h-4" />
              <span className="text-sm">Purchase Price</span>
            </div>
            <span className="text-sm font-medium">
              {formatPrice(ticket.purchasePrice)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Purchased</span>
            </div>
            <span className="text-sm">
              {formatDate(ticket.purchaseTimestamp)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Link
            href={`/event/${ticket.eventContract}`}
            className="btn-secondary flex-1 text-center text-sm py-2"
          >
            View Event
          </Link>
          <a
            href={`https://sepolia.basescan.org/token/${CONTRACTS.TICKET_NFT}?a=${tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center justify-center gap-2 text-sm py-2 px-4"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">View on Explorer</span>
          </a>
        </div>
      </motion.div>

      {/* Info */}
      <div className="text-center text-sm text-gray-400">
        <p>Show this QR code at the venue for entry</p>
        <p className="mt-1">
          Contract: {shortenAddress(ticket.eventContract)}
        </p>
      </div>
    </div>
  );
}
