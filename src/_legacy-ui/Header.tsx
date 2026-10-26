"use client";

import Link from "next/link";
import { scrollToTarget } from "@/engine/scroll";
import type { TreasuryStateSnapshot } from "@/types/treasury";

interface HeaderProps {
  state?: TreasuryStateSnapshot | null;
}

export function Header({ state }: HeaderProps) {
  const protocolVersion = state?.protocolVersion ?? 29;
  const latestLedger = state?.latestLedger ?? 614920;
  const isPaused = state?.paused ?? false;

  const handleCockpitScroll = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToTarget("#cockpit");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-canvas/90 backdrop-blur-md border-b border-hairline transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Mark & Seal */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="group flex items-center gap-3 text-decoration-none focus-visible:outline-2 focus-visible:outline-action-deep rounded-md p-1 -m-1"
          >
            {/* Bespoke Geometric SVG Portus Seal */}
            <div className="relative w-9 h-9 rounded-md bg-canvas flex items-center justify-center p-1.5 shadow-sm group-hover:bg-action-deep transition-colors">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-canvas"
                aria-hidden="true"
              >
                {/* Lisbon Clearinghouse Maritime Compass & Lock Primitives */}
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.75" strokeDasharray="3 2" />
                <path d="M16 6V26" stroke="#D4A24C" strokeWidth="2" strokeLinecap="round" />
                <path d="M6 16H26" stroke="#D4A24C" strokeWidth="2" strokeLinecap="round" />
                <rect x="11" y="11" width="10" height="10" rx="2" fill="#0C0F14" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="16" cy="16" r="2.5" fill="#C59A45" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-[480] text-lg tracking-tight text-canvas leading-none">
                Portus
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-text-2 mt-0.5">
                Treasury Clearing
              </span>
            </div>
          </Link>

          {/* Stellar Testnet Status Indicator */}
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-hairline">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isPaused ? "bg-status-error" : "bg-action-deep animate-pulse"
              }`}
              aria-hidden="true"
            />
            <span className="text-xs font-mono text-text-2 tabular-nums">
              Stellar Testnet v{protocolVersion} · Ledger #{latestLedger.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-text-2" aria-label="Main Navigation">
          <a
            href="#cockpit"
            onClick={handleCockpitScroll}
            className="inline-flex items-center min-h-8 py-1.5 px-2 rounded-md hover:text-canvas transition-colors focus-visible:outline-2 focus-visible:outline-action-deep"
          >
            Live Cockpit
          </a>
          <a
            href="#x402-inspector"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget("#x402-inspector");
            }}
            className="inline-flex items-center min-h-8 py-1.5 px-2 rounded-md hover:text-canvas transition-colors focus-visible:outline-2 focus-visible:outline-action-deep"
          >
            x402 Wire Inspector
          </a>
          <a
            href="#fleet"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget("#fleet");
            }}
            className="inline-flex items-center min-h-8 py-1.5 px-2 rounded-md hover:text-canvas transition-colors focus-visible:outline-2 focus-visible:outline-action-deep"
          >
            Subsidiary Fleet
          </a>
          <Link
            href="/deck"
            className="inline-flex items-center min-h-8 py-1.5 px-2 rounded-md hover:text-canvas transition-colors focus-visible:outline-2 focus-visible:outline-action-deep"
          >
            Pitch Deck
          </Link>
          <Link
            href="/architecture"
            className="inline-flex items-center min-h-8 py-1.5 px-2 rounded-md hover:text-canvas transition-colors focus-visible:outline-2 focus-visible:outline-action-deep"
          >
            Architecture
          </Link>
        </nav>

        {/* Primary CTA */}
        <div className="flex items-center gap-3">
          <a
            href="#cockpit"
            onClick={handleCockpitScroll}
            data-magnetic="0.25"
            className="inline-flex items-center justify-center gap-2 min-h-8 px-4 py-2 text-xs sm:text-sm font-medium text-text bg-action-deep hover:bg-action-deep active:scale-[0.98] rounded-md shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-action-deep"
          >
            <span>Open Vault Cockpit</span>
            <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
