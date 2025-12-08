"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { Ticket, Plus, Wallet, Calendar } from "lucide-react";
import { useTicketsByOwner, useMultipleTicketData } from "@/hooks/useTickets";
import { useEventsByManager, useMultipleEventInfos } from "@/hooks/useEvents";
import { TicketCard, TicketCardSkeleton } from "@/components/TicketCard";
import { EventCard, EventCardSkeleton } from "@/components/EventCard";
import { shortenAddress } from "@/lib/utils";

export default function ProfilePage() {
  const { login, authenticated } = usePrivy();
  const { address, isConnected } = useAccount();

  // Get user's tickets
  const { data: ticketIds, isLoading: loadingTicketIds } = useTicketsByOwner(
    address
  );
  const { data: tickets, isLoading: loadingTickets } = useMultipleTicketData(
    (ticketIds as bigint[]) ?? []
  );

  // Get user's managed events
  const { data: managedEventAddresses, isLoading: loadingManagedAddresses } =
    useEventsByManager(address);
  const { data: managedEvents, isLoading: loadingManagedEvents } =
    useMultipleEventInfos((managedEventAddresses as string[]) ?? []);

  const isLoadingTickets = loadingTicketIds || loadingTickets;
  const isLoadingManagedEvents = loadingManagedAddresses || loadingManagedEvents;

  // Separate active and past tickets
  const { activeTickets, pastTickets } = useMemo(() => {
    const now = Date.now();
    const active: { id: bigint; data: (typeof tickets)[0] }[] = [];
    const past: { id: bigint; data: (typeof tickets)[0] }[] = [];

    ticketIds?.forEach((id, index) => {
      const ticket = tickets[index];
      if (!ticket) return;

      if (Number(ticket.eventDate) * 1000 > now) {
        active.push({ id, data: ticket });
      } else {
        past.push({ id, data: ticket });
      }
    });

    return { activeTickets: active, pastTickets: past };
  }, [ticketIds, tickets]);

  if (!authenticated) {
    return (
      <div className="card text-center py-20 max-w-lg mx-auto">
        <span className="text-6xl mb-4 block">🎫</span>
        <h1 className="text-2xl font-bold mb-2">Your Tickets</h1>
        <p className="text-gray-400 mb-6">
          Connect your wallet to view your tickets and managed events
        </p>
        <button onClick={login} className="btn-primary">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          {address && (
            <div className="flex items-center gap-2 text-gray-400 mt-1">
              <Wallet className="w-4 h-4" />
              <span>{shortenAddress(address)}</span>
            </div>
          )}
        </div>
        <Link href="/create" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Event
        </Link>
      </div>

      {/* Active Tickets */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Ticket className="w-6 h-6 text-primary-400" />
          <h2 className="text-xl font-semibold">Upcoming Tickets</h2>
          {activeTickets.length > 0 && (
            <span className="text-sm text-gray-400">
              ({activeTickets.length})
            </span>
          )}
        </div>

        {isLoadingTickets ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <TicketCardSkeleton key={i} />
            ))}
          </div>
        ) : activeTickets.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTickets.map(({ id, data }, index) => (
              <TicketCard
                key={id.toString()}
                tokenId={id}
                ticket={data!}
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <span className="text-4xl mb-2 block">🎭</span>
            <h3 className="font-semibold mb-1">No Upcoming Tickets</h3>
            <p className="text-gray-400 text-sm mb-4">
              Browse events and get your first ticket!
            </p>
            <Link href="/" className="btn-secondary inline-block text-sm">
              Browse Events
            </Link>
          </motion.div>
        )}
      </section>

      {/* Past Tickets (Memories) */}
      {pastTickets.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold">Memories</h2>
            <span className="text-sm text-gray-400">({pastTickets.length})</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pastTickets.map(({ id, data }, index) => (
              <TicketCard
                key={id.toString()}
                tokenId={id}
                ticket={data!}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* Managed Events */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Plus className="w-6 h-6 text-accent-400" />
          <h2 className="text-xl font-semibold">My Events</h2>
          {managedEventAddresses && managedEventAddresses.length > 0 && (
            <span className="text-sm text-gray-400">
              ({managedEventAddresses.length})
            </span>
          )}
        </div>

        {isLoadingManagedEvents ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(2)].map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : managedEventAddresses && managedEventAddresses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managedEventAddresses.map((address, index) => {
              const eventInfo = managedEvents[index];
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <span className="text-4xl mb-2 block">🎪</span>
            <h3 className="font-semibold mb-1">No Events Created</h3>
            <p className="text-gray-400 text-sm mb-4">
              Create your first event with bonding curve pricing
            </p>
            <Link href="/create" className="btn-primary inline-block text-sm">
              Create Event
            </Link>
          </motion.div>
        )}
      </section>
    </div>
  );
}
