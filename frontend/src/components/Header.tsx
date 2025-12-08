"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { shortenAddress } from "@/lib/utils";

export function Header() {
  const { login, logout, authenticated, user } = usePrivy();
  const { address, isConnected } = useAccount();

  return (
    <header className="glass border-b border-white/5 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐼</span>
            <span className="text-xl font-bold gradient-text">Panda</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Events
            </Link>
            <Link
              href="/create"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Create
            </Link>
            {authenticated && (
              <Link
                href="/profile"
                className="text-gray-300 hover:text-white transition-colors"
              >
                My Tickets
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            {authenticated ? (
              <div className="flex items-center gap-3">
                {isConnected && address && (
                  <span className="text-sm text-gray-400 hidden sm:block">
                    {shortenAddress(address)}
                  </span>
                )}
                <button
                  onClick={logout}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="btn-primary text-sm py-2 px-4"
              >
                Connect
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
