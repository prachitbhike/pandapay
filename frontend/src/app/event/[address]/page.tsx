"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Clock,
  Wallet,
} from "lucide-react";
import { useEventInfo, useCurrentPrice } from "@/hooks/useEvents";
import { PriceCurve } from "@/components/PriceCurve";
import { BuyTicket } from "@/components/BuyTicket";
import {
  formatPrice,
  formatDate,
  getTimeUntil,
  calculatePercentageSold,
  shortenAddress,
} from "@/lib/utils";
import { EventState, CurveType } from "@/lib/contracts";

export default function EventPage() {
  const params = useParams();
  const address = params.address as string;

  const { data: event, isLoading, refetch } = useEventInfo(address);
  const { data: currentPrice } = useCurrentPrice(address);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-24 bg-white/5 rounded" />
        <div className="h-64 bg-white/5 rounded-2xl" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-96 bg-white/5 rounded-2xl" />
          <div className="h-96 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <span className="text-6xl mb-4 block">🔍</span>
        <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
        <p className="text-gray-400 mb-6">
          This event doesn&apos;t exist or has been removed.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Back to Events
        </Link>
      </div>
    );
  }

  const percentSold = calculatePercentageSold(event.ticketsSold, event.maxSupply);
  const remainingTickets = event.maxSupply - event.ticketsSold;
  const eventPassed = Number(event.eventDate) * 1000 < Date.now();

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        {/* Event image/banner */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-primary-500/30 to-accent-500/30 -m-6 mb-6 flex items-center justify-center">
          <span className="text-8xl">🎫</span>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{event.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    event.state === EventState.UPCOMING
                      ? "bg-primary-500/20 text-primary-400"
                      : event.state === EventState.ONGOING
                      ? "bg-yellow-500/20 text-yellow-400"
                      : event.state === EventState.COMPLETED
                      ? "bg-gray-500/20 text-gray-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {EventState[event.state]}
                </span>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    event.curveType === CurveType.EXPONENTIAL
                      ? "bg-accent-500/20 text-accent-400"
                      : "bg-primary-500/20 text-primary-400"
                  }`}
                >
                  {event.curveType === CurveType.EXPONENTIAL
                    ? "Exponential Curve"
                    : "Linear Curve"}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-400">Current Price</div>
              <div className="text-2xl font-bold gradient-text">
                {currentPrice ? formatPrice(currentPrice) : formatPrice(event.currentPrice)}
              </div>
            </div>
          </div>

          <p className="text-gray-300">{event.description}</p>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <Calendar className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <div className="text-xs text-gray-400">Date</div>
                <div className="text-sm font-medium">
                  {formatDate(event.eventDate)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-500/10">
                <Clock className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <div className="text-xs text-gray-400">
                  {eventPassed ? "Status" : "Time Until"}
                </div>
                <div className="text-sm font-medium">
                  {eventPassed ? "Event Passed" : getTimeUntil(event.eventDate)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <MapPin className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-xs text-gray-400">Venue</div>
                <div className="text-sm font-medium">{event.venue}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Wallet className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-xs text-gray-400">Manager</div>
                <div className="text-sm font-medium">
                  {shortenAddress(event.manager)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Price Curve and Stats */}
        <div className="md:col-span-2 space-y-6">
          <PriceCurve
            eventAddress={address}
            maxSupply={event.maxSupply}
            ticketsSold={event.ticketsSold}
            curveType={event.curveType}
          />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="text-2xl font-bold text-white">
                {event.ticketsSold.toString()}
              </div>
              <div className="text-xs text-gray-400">Tickets Sold</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-white">
                {remainingTickets.toString()}
              </div>
              <div className="text-xs text-gray-400">Remaining</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-white">{percentSold}%</div>
              <div className="text-xs text-gray-400">Sold</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-white">
                {formatPrice(event.totalRevenue)}
              </div>
              <div className="text-xs text-gray-400">Revenue</div>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="card">
            <h3 className="font-semibold mb-4">Pricing Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Base Price</div>
                <div className="font-medium">{formatPrice(event.basePrice)}</div>
              </div>
              <div>
                <div className="text-gray-400">Curve Type</div>
                <div className="font-medium">
                  {event.curveType === CurveType.EXPONENTIAL
                    ? "Exponential"
                    : "Linear"}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Curve Parameter</div>
                <div className="font-medium">
                  {event.curveType === CurveType.EXPONENTIAL
                    ? `${Number(event.curveParameter) / 100}% per ticket`
                    : `${formatPrice(event.curveParameter)} per ticket`}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Max Supply</div>
                <div className="font-medium">{event.maxSupply.toString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Buy Section */}
        <div className="space-y-6">
          <BuyTicket
            eventAddress={address}
            remainingTickets={remainingTickets}
            onSuccess={() => refetch()}
          />

          {/* Progress */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold">Ticket Sales</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="font-medium">{percentSold}%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentSold}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{event.ticketsSold.toString()} sold</span>
                <span>{remainingTickets.toString()} left</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
