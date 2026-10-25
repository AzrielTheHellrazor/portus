"use client";

import Link from "next/link";
import { scrollToTarget } from "@/engine/scroll";
import type { TreasuryStateSnapshot } from "@/types/treasury";

interface HeroSectionProps {
  state: TreasuryStateSnapshot;
}

export function HeroSection({ state }: HeroSectionProps) {
  const handleScrollToCockpit = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToTarget("#cockpit");
  };

  const eurcBalance = Number(state.balances.vaultEurc).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const eurUsdRate = state.balances.indicativeEurUsdRate;

  return (
    <section className="relative w-full pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[rgba(12,15,20,0.11)] overflow-hidden">
      {/* Subtle sovereign paper background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #0C0F14 1px, transparent 1px), linear-gradient(to bottom, #0C0F14 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Institutional Thesis */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Eyebrow badge */}
            <div
              data-intro
              data-reveal="fade"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B3B2C]/10 border border-[#0B3B2C]/20 text-[#0B3B2C] text-xs font-mono font-medium tracking-wide uppercase mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B3B2C]" aria-hidden="true" />
              <span>HACKMERIDIAN 2026 · LISBON · STELLAR PROTOCOL 29</span>
            </div>

            {/* Commanding H1 Display Headline */}
            <h1
              data-intro
              data-split="lines"
              className="text-4xl sm:text-5xl lg:text-[clamp(2.5rem,5.2vw,4.75rem)] font-bold text-[#0C0F14] tracking-[-0.035em] leading-[1.06] mb-6"
            >
              Hold Euro Reserves. Settle Dollar Operations Atomically.
            </h1>

            {/* Concise Institutional Thesis */}
            <p
              data-intro
              data-reveal="up"
              data-delay="0.15"
              className="text-base sm:text-lg text-[#4A5260] leading-[1.6] max-w-2xl mb-8 font-normal"
            >
              Portus eliminates multi-currency prefunding and idle foreign dollar float for European enterprises.
              By uniting Soroban <strong className="text-[#0C0F14] font-medium">CAP-0086</strong> spend policies,
              hardware <strong className="text-[#0C0F14] font-medium">secp256r1</strong> CFO Passkeys,
              Stellar&apos;s Native DEX <strong className="text-[#0C0F14] font-medium">pathPaymentStrictReceive</strong>,
              and <strong className="text-[#0C0F14] font-medium">x402</strong> v2 HTTP micropayments, corporate cards
              and autonomous AI agents spend dollars just-in-time from a sovereign Euro balance sheet.
            </p>

            {/* CTAs */}
            <div data-intro data-reveal="up" data-delay="0.25" className="flex flex-wrap items-center gap-4">
              <a
                href="#cockpit"
                onClick={handleScrollToCockpit}
                data-magnetic="0.2"
                className="inline-flex items-center justify-center gap-3 min-h-8 px-6 py-3.5 text-sm font-semibold text-[#FFFFFF] bg-[#0B3B2C] hover:bg-[#12543F] active:scale-[0.98] rounded-md shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-[#0B3B2C]"
              >
                <span>Execute Live Testnet Settlement</span>
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>

              <Link
                href="/architecture"
                className="inline-flex items-center justify-center gap-2 min-h-8 px-5 py-3.5 text-sm font-medium text-[#0C0F14] bg-white border border-[rgba(12,15,20,0.14)] hover:bg-[#F6F5F1] hover:border-[#0C0F14] active:scale-[0.98] rounded-md transition-all focus-visible:outline-2 focus-visible:outline-[#0B3B2C]"
              >
                <span>Inspect Protocol Architecture</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Live Telemetry Micro-Bar */}
            <div className="mt-10 pt-6 border-t border-[rgba(12,15,20,0.10)] w-full grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <span className="block text-[11px] font-mono uppercase tracking-wider text-[#646D7C]">
                  Vault Euro Reserve
                </span>
                <span className="text-sm font-mono font-semibold text-[#0C0F14] tabular-nums">
                  €{eurcBalance} EURC
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-mono uppercase tracking-wider text-[#646D7C]">
                  Native SDEX FX Rate
                </span>
                <span className="text-sm font-mono font-semibold text-[#0C0F14] tabular-nums">
                  1 EURC = ${eurUsdRate} USDC
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block text-[11px] font-mono uppercase tracking-wider text-[#646D7C]">
                  On-Chain Settlement
                </span>
                <span className="text-sm font-mono font-semibold text-[#065F46] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#065F46]" />
                  Atomic · 0 Idle Float
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Bespoke Vector Clearinghouse Atomic Flow Seal */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white border border-[rgba(12,15,20,0.11)] rounded-2xl p-6 shadow-sm relative">
              {/* Header of the Seal Card */}
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(12,15,20,0.08)]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#785316]" aria-hidden="true" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#0C0F14]">
                    Clearinghouse Routing Seal
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#065F46] bg-[#065F46]/10 px-2 py-0.5 rounded font-semibold">
                  SYNCHRONIZED
                </span>
              </div>

              {/* Bespoke Interactive Vector Graphic */}
              <div className="py-6">
                <svg
                  viewBox="0 0 380 340"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto"
                  aria-label="Atomic Clearinghouse Flow Diagram"
                >
                  {/* Subtle Background Coordinate Crosses */}
                  <line x1="190" y1="10" x2="190" y2="330" stroke="rgba(12,15,20,0.05)" strokeDasharray="4 4" />
                  <line x1="10" y1="170" x2="370" y2="170" stroke="rgba(12,15,20,0.05)" strokeDasharray="4 4" />

                  {/* Flow Path 1: EURC Vault to Soroban Policy Guard */}
                  <path
                    d="M190 65 V110"
                    stroke="#0B3B2C"
                    strokeWidth="2.5"
                    strokeDasharray="4 3"
                    className="hero-rail-flow"
                  />

                  {/* Flow Path 2: Soroban Policy Guard to SDEX Orderbook */}
                  <path
                    d="M190 170 V215"
                    stroke="#785316"
                    strokeWidth="2.5"
                    strokeDasharray="4 3"
                    className="hero-rail-flow"
                  />

                  {/* Flow Path 3: SDEX Orderbook to Vendor / x402 Settlement */}
                  <path
                    d="M190 275 V305"
                    stroke="#065F46"
                    strokeWidth="2.5"
                    strokeDasharray="4 3"
                    className="hero-rail-flow"
                  />

                  {/* Node 1: Corporate EURC Vault (Top) */}
                  <g transform="translate(40, 15)">
                    <rect
                      x="0"
                      y="0"
                      width="300"
                      height="50"
                      rx="8"
                      fill="#F6F5F1"
                      stroke="rgba(12,15,20,0.14)"
                      strokeWidth="1.5"
                    />
                    <circle cx="25" cy="25" r="10" fill="#0B3B2C" />
                    <text x="25" y="29" fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
                      €
                    </text>
                    <text x="48" y="22" fill="#0C0F14" fontSize="12" fontWeight="600" fontFamily="var(--font-sans)">
                      Corporate EURC Soroban Vault
                    </text>
                    <text x="48" y="38" fill="#4A5260" fontSize="10" fontFamily="var(--font-mono)">
                      Hold EUR Reserves · 0 Idle Dollar Float
                    </text>
                  </g>

                  {/* Node 2: Soroban Policy Guard & CFO Passkey (Middle) */}
                  <g transform="translate(40, 115)">
                    <rect
                      x="0"
                      y="0"
                      width="300"
                      height="55"
                      rx="8"
                      fill="#0C0F14"
                      stroke="#D4A24C"
                      strokeWidth="1.5"
                    />
                    <rect x="15" y="15" width="24" height="24" rx="4" fill="#D4A24C" />
                    <text x="27" y="31" fill="#0C0F14" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">
                      P
                    </text>
                    <text x="48" y="24" fill="#FFFFFF" fontSize="12" fontWeight="600" fontFamily="var(--font-sans)">
                      CAP-0086 Policy & secp256r1 Passkey
                    </text>
                    <text x="48" y="41" fill="#D4A24C" fontSize="10" fontFamily="var(--font-mono)">
                      On-Chain Merchant Whitelist & Daily Limit
                    </text>
                  </g>

                  {/* Node 3: Native SDEX Orderbook (Lower-Middle) */}
                  <g transform="translate(40, 220)">
                    <rect
                      x="0"
                      y="0"
                      width="300"
                      height="55"
                      rx="8"
                      fill="#F6F5F1"
                      stroke="rgba(12,15,20,0.14)"
                      strokeWidth="1.5"
                    />
                    <circle cx="27" cy="27" r="12" fill="#065F46" fillOpacity="0.15" stroke="#065F46" strokeWidth="1.5" />
                    <text x="27" y="31" fill="#065F46" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
                      ⇄
                    </text>
                    <text x="48" y="24" fill="#0C0F14" fontSize="12" fontWeight="600" fontFamily="var(--font-sans)">
                      Native SDEX pathPaymentStrictReceive
                    </text>
                    <text x="48" y="41" fill="#4A5260" fontSize="10" fontFamily="var(--font-mono)">
                      Atomic JIT FX Conversion (1 EURC = ${eurUsdRate} USDC)
                    </text>
                  </g>

                  {/* Node 4: Final Settlement Terminal (Bottom) */}
                  <g transform="translate(60, 305)">
                    <rect
                      x="0"
                      y="0"
                      width="260"
                      height="26"
                      rx="6"
                      fill="#065F46"
                    />
                    <text x="130" y="17" fill="#FFFFFF" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="var(--font-mono)">
                      USDC Delivered to Cloud Vendor / x402 API
                    </text>
                  </g>
                </svg>
              </div>

              {/* Explanatory Footer Pill */}
              <div className="bg-[#F6F5F1] rounded-lg p-3 border border-[rgba(12,15,20,0.08)] flex items-center justify-between text-xs font-mono">
                <span className="text-[#4A5260]">Atomic Sequence:</span>
                <span className="font-semibold text-[#0B3B2C]">Single Stellar Envelope (1 Ledger)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
