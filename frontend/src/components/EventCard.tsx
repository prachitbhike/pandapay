"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, TrendingUp } from "lucide-react";
import { EventInfo, CurveType } from "@/lib/contracts";
import {
  formatPrice,
  formatDateShort,
  getTimeUntil,
  calculatePercentageSold,
} from "@/lib/utils";

interface EventCardProps {
  address: string;
  event: EventInfo;
  index?: number;
}

export function EventCard({ address, event, index = 0 }: EventCardProps) {
  const percentSold = calculatePercentageSold(event.ticketsSold, event.maxSupply);
  const isAlmostSoldOut = percentSold > 80;
  const isSoldOut = event.ticketsSold >= event.maxSupply;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/event/${address}`}>
        <div className="card group hover:border-primary-500/30 transition-all duration-300 cursor-pointer">
          {/* Event image placeholder */}
          <div className="h-40 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl mb-4 flex items-center justify-center">
            <span className="text-6xl">🎫</span>
          </div>

          {/* Event details */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-1">
                {event.name}
              </h3>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  isSoldOut
                    ? "bg-red-500/20 text-red-400"
                    : isAlmostSoldOut
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-primary-500/20 text-primary-400"
                }`}
              >
                {isSoldOut
                  ? "Sold Out"
                  : isAlmostSoldOut
                  ? "Almost Gone"
                  : "Available"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{formatDateShort(event.eventDate)}</span>
              <span className="text-primary-400 ml-auto">
                {getTimeUntil(event.eventDate)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-gray-400">
                  <Users className="w-3 h-3" />
                  <span>
                    {event.ticketsSold.toString()}/{event.maxSupply.toString()}
                  </span>
                </div>
                <span className="text-gray-400">{percentSold}% sold</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isAlmostSoldOut
                      ? "bg-gradient-to-r from-yellow-500 to-red-500"
                      : "bg-gradient-to-r from-primary-500 to-accent-500"
                  }`}
                  style={{ width: `${percentSold}%` }}
                />
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <TrendingUp
                  className={`w-4 h-4 ${
                    event.curveType === CurveType.EXPONENTIAL
                      ? "text-accent-400"
                      : "text-primary-400"
                  }`}
                />
                <span className="text-xs text-gray-400">
                  {event.curveType === CurveType.EXPONENTIAL
                    ? "Exponential"
                    : "Linear"}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Current price</div>
                <div className="text-lg font-bold text-white">
                  {formatPrice(event.currentPrice)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-40 bg-white/5 rounded-xl mb-4" />
      <div className="space-y-3">
        <div className="h-6 bg-white/5 rounded w-3/4" />
        <div className="h-4 bg-white/5 rounded w-1/2" />
        <div className="h-4 bg-white/5 rounded w-2/3" />
        <div className="h-2 bg-white/5 rounded-full" />
        <div className="h-8 bg-white/5 rounded" />
      </div>
    </div>
  );
}
