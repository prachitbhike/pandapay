"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, QrCode } from "lucide-react";
import { TicketData } from "@/lib/contracts";
import { formatPrice, formatDateShort } from "@/lib/utils";

interface TicketCardProps {
  tokenId: bigint;
  ticket: TicketData;
  index?: number;
}

export function TicketCard({ tokenId, ticket, index = 0 }: TicketCardProps) {
  const eventPassed = Number(ticket.eventDate) * 1000 < Date.now();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/ticket/${tokenId.toString()}`}>
        <div
          className={`card group hover:border-primary-500/30 transition-all duration-300 cursor-pointer ${
            eventPassed ? "opacity-70" : ""
          }`}
        >
          {/* Ticket visual */}
          <div className="relative">
            <div className="h-32 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <span className="text-5xl font-bold text-white">
                  #{ticket.ticketNumber.toString()}
                </span>
              </div>
            </div>

            {/* Status badge */}
            <div
              className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full ${
                eventPassed
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-primary-500/20 text-primary-400"
              }`}
            >
              {eventPassed ? "Memory" : "Active"}
            </div>

            {/* QR icon */}
            <div className="absolute bottom-2 right-2 p-2 rounded-lg bg-black/50 group-hover:bg-primary-500/20 transition-colors">
              <QrCode className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Ticket details */}
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-1">
              {ticket.eventName}
            </h3>

            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{formatDateShort(ticket.eventDate)}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{ticket.venue}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-xs text-gray-400">Paid</span>
              <span className="text-sm font-medium text-white">
                {formatPrice(ticket.purchasePrice)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function TicketCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-32 bg-white/5 rounded-xl" />
      <div className="mt-4 space-y-2">
        <div className="h-5 bg-white/5 rounded w-3/4" />
        <div className="h-4 bg-white/5 rounded w-1/2" />
        <div className="h-4 bg-white/5 rounded w-2/3" />
      </div>
    </div>
  );
}
