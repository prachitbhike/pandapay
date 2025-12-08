"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Shield, Ticket } from "lucide-react";
import { useAllEvents, useMultipleEventInfos } from "@/hooks/useEvents";
import { EventCard, EventCardSkeleton } from "@/components/EventCard";

export default function Home() {
  const { data: eventAddresses, isLoading: loadingAddresses } = useAllEvents();
  const { data: eventInfos, isLoading: loadingInfos } = useMultipleEventInfos(
    (eventAddresses as string[]) ?? []
  );

  const isLoading = loadingAddresses || loadingInfos;
  const hasEvents = eventAddresses && eventAddresses.length > 0;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-center">
            <span className="text-8xl">🐼</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold">
            <span className="gradient-text">Dynamic Pricing</span>
            <br />
            <span className="text-white">for Events</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get tickets early, pay less. Our bonding curve pricing rewards early
            supporters with the best prices.
          </p>
        </motion.div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center"
        >
          <TrendingUp className="w-10 h-10 text-primary-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Bonding Curves</h3>
          <p className="text-gray-400 text-sm">
            Prices increase as tickets sell. Early believers get the best deals.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center"
        >
          <Ticket className="w-10 h-10 text-accent-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">NFT Tickets</h3>
          <p className="text-gray-400 text-sm">
            Your ticket becomes a collectible memory after the event.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card text-center"
        >
          <Shield className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">On-Chain Verification</h3>
          <p className="text-gray-400 text-sm">
            No fake tickets. Every purchase is verified on the blockchain.
          </p>
        </motion.div>
      </section>

      {/* Events Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-400" />
            Upcoming Events
          </h2>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : hasEvents ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventAddresses?.map((address, index) => {
              const eventInfo = eventInfos[index];
              if (!eventInfo) return null;
              return (
                <EventCard
                  key={address}
                  address={address}
                  event={eventInfo}
                  index={index}
                />
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-16">
            <span className="text-6xl mb-4 block">🎭</span>
            <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
            <p className="text-gray-400 mb-6">
              Be the first to create an event with bonding curve pricing!
            </p>
            <a href="/create" className="btn-primary inline-block">
              Create Event
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
