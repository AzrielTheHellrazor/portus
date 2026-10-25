import Link from "next/link";
import type { TreasuryStateSnapshot } from "@/types/treasury";
import {
  stellarLabContractUrl,
  stellarExpertContractUrl,
} from "./treasury/stellar-lab";

interface FooterProps {
  state?: TreasuryStateSnapshot | null;
}

export function Footer({ state }: FooterProps) {
  const vaultId =
    state?.vaultContractId ??
    "CD4S3FUVKPPHQMOI36AWTPGBYNWYRVHFNMRPATEIHENURQK77A5YTMWU";
  const factoryId =
    state?.factoryContractId ??
    "CC2Q2JLSIHMIXS4VQMNG57FXO4LPUQPSK2Z6CQAQXH5AKL6Y5NX4TBCF";

  return (
    <footer className="w-full bg-[#0C0F14] text-[#F6F5F1] border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand & Historical Context */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded bg-white flex items-center justify-center p-1">
                  <svg viewBox="0 0 32 32" fill="none" className="w-full h-full text-[#0C0F14]" aria-hidden="true">
                    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
                    <path d="M16 6V26" stroke="#D4A24C" strokeWidth="2.5" />
                    <path d="M6 16H26" stroke="#D4A24C" strokeWidth="2.5" />
                    <rect x="11" y="11" width="10" height="10" rx="2" fill="#0C0F14" />
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  Portus Treasury
                </span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed max-w-sm">
                Named after Lisbon&apos;s historic maritime clearinghouse. Enabling European balance sheet sovereignty
                with atomic dollar settlement across the Stellar Network.
              </p>
            </div>

            <div className="mt-6 text-xs font-mono text-white/75">
              <span>HackMeridian 2026 · Lisbon, Portugal</span>
              <span className="block mt-0.5">Genesis Path · Stellar Unlocked & Stellar Composed</span>
            </div>
          </div>

          {/* Col 2: Contract Hashes & Telemetry */}
          <div className="md:col-span-4 font-mono text-xs">
            <span className="text-[11px] uppercase tracking-wider text-[#D4A24C] font-semibold block mb-3">
              On-Chain Contract Manifest
            </span>
            <div className="space-y-3 text-white/90">
              <div>
                <span className="text-white/75 block text-[10px] uppercase">TREASURY VAULT (SOROBAN)</span>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  <span className="text-white font-mono select-all">
                    {vaultId.slice(0, 18)}...{vaultId.slice(-4)}
                  </span>
                  <a
                    href={stellarExpertContractUrl(vaultId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center min-h-8 py-1.5 px-2 text-[#34D399] hover:underline"
                    title="Verify on Stellar Expert"
                  >
                    Expert ↗
                  </a>
                  <a
                    href={stellarLabContractUrl(vaultId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center min-h-8 py-1.5 px-2 text-[#D4A24C] hover:underline font-semibold"
                    title="Inspect in SDF Stellar Lab"
                  >
                    Lab ↗
                  </a>
                </div>
              </div>

              <div>
                <span className="text-white/75 block text-[10px] uppercase">CAP-0085 FACTORY</span>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  <span className="text-white font-mono select-all">
                    {factoryId.slice(0, 18)}...{factoryId.slice(-4)}
                  </span>
                  <a
                    href={stellarExpertContractUrl(factoryId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center min-h-8 py-1.5 px-2 text-[#34D399] hover:underline"
                    title="Verify on Stellar Expert"
                  >
                    Expert ↗
                  </a>
                  <a
                    href={stellarLabContractUrl(factoryId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center min-h-8 py-1.5 px-2 text-[#D4A24C] hover:underline font-semibold"
                    title="Inspect in SDF Stellar Lab"
                  >
                    Lab ↗
                  </a>
                </div>
              </div>

              <div>
                <span className="text-white/75 block text-[10px] uppercase">NETWORK PASSPHRASE</span>
                <span className="text-white/90 block mt-0.5">Test SDF Network ; September 2015</span>
              </div>
            </div>
          </div>

          {/* Col 3: Navigation & Spec */}
          <div className="md:col-span-3 text-sm flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#D4A24C] font-semibold block mb-3">
                Protocol Documentation
              </span>
              <ul className="space-y-1 font-medium text-white/90">
                <li>
                  <Link
                    href="/architecture"
                    className="inline-flex items-center min-h-8 py-1.5 px-1 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-[#34D399]"
                  >
                    Technical Architecture Specification
                  </Link>
                </li>
                <li>
                  <a
                    href="#cockpit"
                    className="inline-flex items-center min-h-8 py-1.5 px-1 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-[#34D399]"
                  >
                    Live Testnet Cockpit
                  </a>
                </li>
                <li>
                  <a
                    href="#x402-inspector"
                    className="inline-flex items-center min-h-8 py-1.5 px-1 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-[#34D399]"
                  >
                    x402 v2 Protocol Trace
                  </a>
                </li>
                <li>
                  <a
                    href="#fleet"
                    className="inline-flex items-center min-h-8 py-1.5 px-1 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-[#34D399]"
                  >
                    Subsidiary Fleet (CAP-0085)
                  </a>
                </li>
              </ul>
            </div>

            <div className="mt-6 text-xs text-white/75 font-mono">
              Protocol 29 · Core Engine v1.0.0
            </div>
          </div>
        </div>

        {/* Bottom Colophon */}
        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-white/75">
          <div>
            © 2026 Portus Clearinghouse Consortium. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Stellar Testnet Verified</span>
            <span>secp256r1 Enabled</span>
            <span>RFC 9110 / x402</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
