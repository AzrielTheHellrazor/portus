"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  stellarLabContractUrl,
  stellarExpertContractUrl,
  stellarExpertTxUrl,
} from "@/components/treasury/stellar-lab";

interface SlideData {
  number: string;
  category: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

const TOTAL_SLIDES = 8;

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < TOTAL_SLIDES - 1 ? prev + 1 : prev));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < TOTAL_SLIDES) {
      setCurrentSlide(index);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is inside an input/textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowRight" || e.key === " " || e.key === "j" || e.key === "PageDown") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "k" || e.key === "PageUp") {
        e.preventDefault();
        prevSlide();
      } else if (e.key >= "1" && e.key <= "8") {
        const slideIdx = parseInt(e.key, 10) - 1;
        goToSlide(slideIdx);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, goToSlide]);

  const slides: SlideData[] = [
    // ----------------------------------------------------
    // SLIDE 1: Title & Vision
    // ----------------------------------------------------
    {
      number: "01",
      category: "GENESIS PATH FINALIST · HACKMERIDIAN 2026 LISBON",
      title: "Portus: Institutional Multi-Currency Corporate Treasury on Stellar",
      subtitle:
        "Hold Euro reserves natively in EURC SAC. Settle USD operations atomically via SDEX path payments in < 3.5s with zero idle dollar float.",
      content: (
        <div className="space-y-6">
          {/* Main Visual Card */}
          <div className="bg-raised border border-white/12 rounded-[var(--radius-card)] p-6 sm:p-8 text-canvas shadow-2xl relative overflow-hidden">
            {/* Top decorative badge row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10 text-xs font-mono">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-action-deep text-canvas font-semibold">
                <span className="w-2 h-2 rounded-full bg-action animate-pulse" />
                <span>STELLAR PROTOCOL 29 · LIVE TESTNET</span>
              </div>
              <span className="text-brass font-semibold">
                DUAL TRACK: STELLAR UNLOCKED + STELLAR COMPOSED
              </span>
            </div>

            {/* Core Value Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
              <div className="bg-canvas border border-white/10 p-5 rounded-xl">
                <div className="text-[11px] font-mono uppercase tracking-wider text-brass font-[500] mb-1">
                  Pillar 01 · Custody
                </div>
                <div className="text-xl font-[480] text-white mb-2">100% Euro Reserve</div>
                <p className="text-xs text-white/70 leading-relaxed font-[380]">
                  Enterprises maintain balance sheets entirely in Soroban-guarded <code className="text-brass">EURC</code> SAC contracts under European MiCA regulatory clarity.
                </p>
              </div>

              <div className="bg-canvas border border-white/10 p-5 rounded-xl">
                <div className="text-[11px] font-mono uppercase tracking-wider text-brass font-[500] mb-1">
                  Pillar 02 · Atomic FX
                </div>
                <div className="text-xl font-[480] text-white mb-2">Zero Idle USD Float</div>
                <p className="text-xs text-white/70 leading-relaxed font-[380]">
                  When employee cards or AI agents spend USD, Stellar Native SDEX executes <code className="text-brass">pathPaymentStrictReceive</code> just-in-time in &lt; 3.5s.
                </p>
              </div>

              <div className="bg-canvas border border-white/10 p-5 rounded-xl">
                <div className="text-[11px] font-mono uppercase tracking-wider text-brass font-[500] mb-1">
                  Pillar 03 · Governance
                </div>
                <div className="text-xl font-[480] text-white mb-2">Hardware Passkeys</div>
                <p className="text-xs text-white/70 leading-relaxed font-[380]">
                  CFO governance via hardware WebAuthn <code className="text-brass">secp256r1</code> P-256 signatures validated on-chain with OpenZeppelin Pausable circuit breakers.
                </p>
              </div>
            </div>

            {/* Live Metrics Footnote */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-white/60">
              <div className="flex items-center gap-2">
                <span className="text-brass">Presenter:</span>
                <span className="text-white">Portus Engineering Consortium</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Lisbon Maritime Clearinghouse</span>
                <span>•</span>
                <span className="text-action">5/5 Testnet E2E Tests Passing</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLIDE 2: The Currency Paradox
    // ----------------------------------------------------
    {
      number: "02",
      category: "PROBLEM STATEMENT & MARKET PAIN",
      title: "The Currency Paradox: The $42B European Liquidity Trap",
      subtitle:
        "European startups and enterprises earn and account in Euros, but 70%+ of operational spend (AWS, Google Cloud, OpenAI, overseas SaaS) requires US Dollars.",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pain 1 */}
            <div className="bg-raised border border-white/10 rounded-[var(--radius-card)] p-6 text-canvas shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-status-error mb-2 font-[500]">
                  <span>FRICTION 01</span>
                  <span>IDLE FLOAT</span>
                </div>
                <h3 className="text-lg font-[480] text-white mb-2">Trapped Working Capital</h3>
                <p className="text-xs text-white/70 leading-relaxed font-[380]">
                  Enterprises pre-fund $100k to $500k in foreign USD bank accounts earning 0% yield across fragmented regional banking silos just to cover recurring overseas cloud invoices.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/10 text-xs font-mono text-brass">
                Cost: €18,000+ Annual Cost of Capital
              </div>
            </div>

            {/* Pain 2 */}
            <div className="bg-raised border border-white/10 rounded-[var(--radius-card)] p-6 text-canvas shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-status-error mb-2 font-[500]">
                  <span>FRICTION 02</span>
                  <span>FX TAX & DELAY</span>
                </div>
                <h3 className="text-lg font-[480] text-white mb-2">2-3% Spreads & 48h Wires</h3>
                <p className="text-xs text-white/70 leading-relaxed font-[380]">
                  Traditional correspondent banking extracts 150-300 bps on every cross-currency wire, compounded by 2-day SWIFT settlement lags and manual finance operations reconciliation.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/10 text-xs font-mono text-brass">
                Loss: $25k per $1M Overseas Spend
              </div>
            </div>

            {/* Pain 3 */}
            <div className="bg-raised border border-white/10 rounded-[var(--radius-card)] p-6 text-canvas shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-status-error mb-2 font-[500]">
                  <span>FRICTION 03</span>
                  <span>AI AGENT RISK</span>
                </div>
                <h3 className="text-lg font-[480] text-white mb-2">The Autonomous Agent Dilemma</h3>
                <p className="text-xs text-white/70 leading-relaxed font-[380]">
                  Enterprises deploying autonomous AI agents cannot safely give them corporate credit cards or unrestricted bank API access without catastrophic overdraft and balance leakage risks.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/10 text-xs font-mono text-brass">
                Vulnerability: Unbounded Balance Leakage
              </div>
            </div>
          </div>

          {/* Institutional Quote Box */}
          <div className="bg-canvas border border-brass/30 rounded-xl p-5 text-canvas">
            <blockquote className="text-sm sm:text-base font-serif italic text-white/90 leading-relaxed">
              &ldquo;European CFOs are forced to act as involuntary currency speculators just to pay their cloud bills. Managing multiple foreign bank balances is a relic of 20th-century correspondent banking.&rdquo;
            </blockquote>
            <div className="mt-3 text-xs font-mono text-brass">
              : Lisbon Maritime Clearinghouse Treasury Problem Brief
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLIDE 3: The Portus Architecture
    // ----------------------------------------------------
    {
      number: "03",
      category: "SOLUTION & ARCHITECTURAL FOUNDATION",
      title: "The Portus Architecture: Atomic JIT Treasury Settlement",
      subtitle:
        "Hold Euro reserves in a Soroban EURC vault. Settle USD operational expenses atomically via SDEX path payments in < 3.5s.",
      content: (
        <div className="space-y-6">
          {/* 4-Stage Visual Sequence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-raised border border-white/10 p-5 rounded-xl text-canvas flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-brass mb-2 font-[500]">
                  <span>STEP 01</span>
                  <span>CLIENT INITIATION</span>
                </div>
                <h4 className="font-[480] text-sm text-white mb-1.5">Spend Demand</h4>
                <p className="text-xs text-white/70 leading-relaxed font-[380]">
                  Employee card pays $125 AWS invoice or autonomous bot requests $2 paywalled macro intelligence feed.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/10 text-[10px] font-mono text-white/50">
                Trigger: ECDSA / x402 Header
              </div>
            </div>

            <div className="bg-canvas border border-brass/40 p-5 rounded-xl text-canvas flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-brass mb-2 font-[500]">
                  <span>STEP 02</span>
                  <span>SOROBAN VM</span>
                </div>
                <h4 className="font-[480] text-sm text-white mb-1.5">CAP-0086 Policy Guard</h4>
                <p className="text-xs text-white/70 leading-relaxed font-[380]">
                  On-chain evaluation of spender whitelist, merchant address, daily cap, and OpenZeppelin Pausable status.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/10 text-[10px] font-mono text-brass">
                Security: 0 EURC Leaked on Revert
              </div>
            </div>

            <div className="bg-raised border border-white/10 p-5 rounded-xl text-canvas flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-action mb-2 font-[500]">
                  <span>STEP 03</span>
                  <span>NATIVE SDEX</span>
                </div>
                <h4 className="font-[480] text-sm text-white mb-1.5">pathPaymentStrictReceive</h4>
                <p className="text-xs text-white/70 leading-relaxed font-[380]">
                  Protocol orderbook automatically debits exact EURC (23.06 EURC) and delivers exact USDC ($25.00) in 1 ledger step.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/10 text-[10px] font-mono text-action">
                Execution: Protocol-Level DEX
              </div>
            </div>

            <div className="bg-action-deep/40 border border-action-deep p-5 rounded-xl text-canvas flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-action mb-2 font-[500]">
                  <span>STEP 04</span>
                  <span>CONFIRMATION</span>
                </div>
                <h4 className="font-[480] text-sm text-white mb-1.5">Instant Settlement</h4>
                <p className="text-xs text-white/70 leading-relaxed font-[380]">
                  Vendor receives settled USDC; autonomous agent unlocks HTTP 200 OK payload. Full cryptographic receipt emitted.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/10 text-[10px] font-mono text-action">
                Duration: &lt; 3.5s · Final Ledger
              </div>
            </div>
          </div>

          {/* Architectural Comparison Strip */}
          <div className="bg-raised border border-white/10 p-5 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-white/80">
            <div>
              <span className="text-brass block font-semibold mb-1">CAPITAL EFFICIENCY</span>
              <span>100% in EURC reserve. Zero idle dollars stored.</span>
            </div>
            <div>
              <span className="text-brass block font-semibold mb-1">SLIPPAGE CONTROL</span>
              <span>Exact destination amount delivered with strict source max ceiling.</span>
            </div>
            <div>
              <span className="text-brass block font-semibold mb-1">AUDIT TRAIL</span>
              <span>Every spend bound to on-chain policy ID and cost center tag.</span>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLIDE 4: Dual-Track Protocol Innovation
    // ----------------------------------------------------
    {
      number: "04",
      category: "TECHNICAL SPECIFICATION & INNOVATION",
      title: "Dual-Track Protocol Innovation: Unlocked & Composed",
      subtitle:
        "Portus satisfies every technical dimension of both Stellar Unlocked (core primitives) and Stellar Composed (ecosystem standards).",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stellar Unlocked Card */}
          <div className="bg-raised border border-white/10 rounded-[var(--radius-card)] p-6 text-canvas">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="text-xs font-mono text-brass font-semibold tracking-wider">
                TRACK 01: STELLAR UNLOCKED
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono">
                CORE PROTOCOL
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-[480] text-white text-sm">Native SDEX pathPaymentStrictReceive</h4>
                <p className="text-white/70 mt-1 leading-relaxed font-[380]">
                  Direct protocol-level order matching swaps EURC to USDC atomically without intermediate custodial contracts or off-chain aggregators.
                </p>
              </div>

              <div>
                <h4 className="font-[480] text-white text-sm">Classic Asset + SAC Bridge (SEP-41)</h4>
                <p className="text-white/70 mt-1 leading-relaxed font-[380]">
                  Bridges classic Stellar trustlines directly into Soroban smart contract custody with unified token operations.
                </p>
              </div>

              <div>
                <h4 className="font-[480] text-white text-sm">CAP-0085 Shared Executable Fleet</h4>
                <p className="text-white/70 mt-1 leading-relaxed font-[380]">
                  Regional subsidiary vaults reference a single audited Wasm bytecode hash (<code className="text-brass">v1_vault</code>), slashing state rent by 98%.
                </p>
              </div>

              <div>
                <h4 className="font-[480] text-white text-sm">CAP-0086 Sparse Policy Structs</h4>
                <p className="text-white/70 mt-1 leading-relaxed font-[380]">
                  Discretionary attributes (<code className="text-brass">cost_center</code>, <code className="text-brass">max_single_tx</code>) omit absent keys on-wire, unpacking via sparse map slicing.
                </p>
              </div>
            </div>
          </div>

          {/* Stellar Composed Card */}
          <div className="bg-raised border border-white/10 rounded-[var(--radius-card)] p-6 text-canvas">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="text-xs font-mono text-action font-[500] tracking-wider">
                TRACK 02: STELLAR COMPOSED
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono">
                ECOSYSTEM PRIMITIVES
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-[480] text-white text-sm">x402 v2 Machine Payments Protocol</h4>
                <p className="text-white/70 mt-1 leading-relaxed font-[380]">
                  Full implementation of the newly released <code className="text-action">@x402/stellar</code> v2 standard for HTTP 402 paywall negotiation settled via JIT SAC transfers.
                </p>
              </div>

              <div>
                <h4 className="font-[480] text-white text-sm">Hardware WebAuthn secp256r1 CFO Passkeys</h4>
                <p className="text-white/70 mt-1 leading-relaxed font-[380]">
                  Hardware TouchID/FaceID signatures validated natively via Soroban <code className="text-action">secp256r1_verify</code> with low-S canonical normalization.
                </p>
              </div>

              <div>
                <h4 className="font-[480] text-white text-sm">OpenZeppelin Soroban v0.8.0 Integration</h4>
                <p className="text-white/70 mt-1 leading-relaxed font-[380]">
                  Audited <code className="text-action">stellar-access</code> Ownable and <code className="text-action">stellar-contract-utils</code> Pausable emergency kill-switch primitives.
                </p>
              </div>

              <div>
                <h4 className="font-[480] text-white text-sm">Bounded Autonomous Agent Sub-Accounts</h4>
                <p className="text-white/70 mt-1 leading-relaxed font-[380]">
                  AI bots operate within deterministic daily and per-transaction spending fences, completely insulated from enterprise balance sheet float.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLIDE 5: Ecosystem Landscape & Competitive Moats
    // ----------------------------------------------------
    {
      number: "05",
      category: "MARKET POSITIONING & COMPETITIVE MOATS",
      title: "Ecosystem Landscape: Grounded Comparison & Moats",
      subtitle:
        "Portus establishes an institutional corporate clearinghouse category, grounded against SCF awardees and generic agent wallets.",
      content: (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-canvas border-collapse bg-raised rounded-xl overflow-hidden border border-white/10">
              <thead>
                <tr className="bg-canvas border-b border-white/10 font-mono text-[11px] text-brass">
                  <th className="p-3">Solution</th>
                  <th className="p-3">Target & Funding</th>
                  <th className="p-3">Reserve Model</th>
                  <th className="p-3">Policy Enforcement</th>
                  <th className="p-3">Autonomous AI / x402</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                <tr>
                  <td className="p-3 font-semibold text-white">Venerez</td>
                  <td className="p-3 text-white/70 font-mono">$99k SCF · LatAm B2B</td>
                  <td className="p-3 text-white/70">Pre-funded fiat / single-tenant card</td>
                  <td className="p-3 text-white/70">Off-chain banking portal rules</td>
                  <td className="p-3 text-status-error font-mono">None (human card only)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">JoonaPay</td>
                  <td className="p-3 text-white/70 font-mono">$90k SCF · West Africa</td>
                  <td className="p-3 text-white/70">Consumer remittance / P2P float</td>
                  <td className="p-3 text-white/70">Centralized mobile wallet backend</td>
                  <td className="p-3 text-status-error font-mono">None (consumer app)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Bando</td>
                  <td className="p-3 text-white/70 font-mono">$75k SCF · LatAm API</td>
                  <td className="p-3 text-white/70">Fintech off-ramp / pre-funded credit</td>
                  <td className="p-3 text-white/70">Application API endpoints</td>
                  <td className="p-3 text-status-error font-mono">None (consumer cards)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Standalone x402 Wallets</td>
                  <td className="p-3 text-white/70 font-mono">Open-source agent keys</td>
                  <td className="p-3 text-white/70">Prepaid hot wallet (USDC)</td>
                  <td className="p-3 text-white/70">None (unbounded key access)</td>
                  <td className="p-3 text-brass font-mono">Raw unconstrained spend</td>
                </tr>
                <tr className="bg-action-deep/30 font-semibold border-t-2 border-action">
                  <td className="p-3 text-action font-[480]">PORTUS (Lisbon Genesis)</td>
                  <td className="p-3 text-white font-mono">HackMeridian Dual-Track</td>
                  <td className="p-3 text-action">100% EURC reserve + JIT SDEX</td>
                  <td className="p-3 text-action">Soroban VM + CAP-0086 Guard</td>
                  <td className="p-3 text-action font-mono">Bounded x402 v2 JIT channels</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3 Core Moats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-canvas border border-white/10 p-4 rounded-xl text-xs">
              <span className="font-mono text-brass font-semibold block mb-1">
                Moat 1: Zero Pre-funding
              </span>
              <p className="text-white/70 leading-relaxed">
                Enterprises never convert foreign cash in advance. SDEX path payments buy exact USD at the millisecond of invoice settlement.
              </p>
            </div>
            <div className="bg-canvas border border-white/10 p-4 rounded-xl text-xs">
              <span className="font-mono text-brass font-semibold block mb-1">
                Moat 2: CAP-0085 Scaling
              </span>
              <p className="text-white/70 leading-relaxed">
                Deploy 50 regional European subsidiaries sharing one audited Wasm bytecode reference, slashing state storage fees by over 98%.
              </p>
            </div>
            <div className="bg-canvas border border-white/10 p-4 rounded-xl text-xs">
              <span className="font-mono text-brass font-semibold block mb-1">
                Moat 3: Cryptographic Audit
              </span>
              <p className="text-white/70 leading-relaxed">
                Every policy modification requires a hardware P-256 WebAuthn signature, verifiable on-chain via Soroban host functions.
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLIDE 6: Live Stellar Testnet Verification
    // ----------------------------------------------------
    {
      number: "06",
      category: "EXECUTION PROOF & CONTRACT VERIFICATION",
      title: "Live Stellar Testnet Verification (Protocol 29)",
      subtitle:
        "Every claim is backed by real deployed Soroban smart contracts, orderbook liquidity, and automated passing test suites.",
      content: (
        <div className="space-y-6">
          {/* Contracts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-raised border border-white/10 p-4 rounded-xl text-canvas space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-brass font-semibold">Treasury Vault Contract</span>
                <span className="text-action">ACTIVE</span>
              </div>
              <div className="font-mono text-xs text-white/90 truncate bg-black/40 p-2 rounded border border-white/5">
                CD4S3FUVKPPHQMOI36AWTPGBYNWYRVHFNMRPATEIHENURQK77A5YTMWU
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <a
                  href={stellarExpertContractUrl("CD4S3FUVKPPHQMOI36AWTPGBYNWYRVHFNMRPATEIHENURQK77A5YTMWU")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-action underline underline-offset-2 hover:text-white"
                >
                  Stellar Expert ↗
                </a>
                <span>•</span>
                <a
                  href={stellarLabContractUrl("CD4S3FUVKPPHQMOI36AWTPGBYNWYRVHFNMRPATEIHENURQK77A5YTMWU")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brass underline underline-offset-2 hover:text-white"
                >
                  SDF Stellar Lab ↗
                </a>
              </div>
            </div>

            <div className="bg-raised border border-white/10 p-4 rounded-xl text-canvas space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-brass font-semibold">Vault Factory Contract (CAP-0085)</span>
                <span className="text-action">ACTIVE</span>
              </div>
              <div className="font-mono text-xs text-white/90 truncate bg-black/40 p-2 rounded border border-white/5">
                CC2Q2JLSIHMIXS4VQMNG57FXO4LPUQPSK2Z6CQAQXH5AKL6Y5NX4TBCF
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <a
                  href={stellarExpertContractUrl("CC2Q2JLSIHMIXS4VQMNG57FXO4LPUQPSK2Z6CQAQXH5AKL6Y5NX4TBCF")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-action underline underline-offset-2 hover:text-white"
                >
                  Stellar Expert ↗
                </a>
                <span>•</span>
                <a
                  href={stellarLabContractUrl("CC2Q2JLSIHMIXS4VQMNG57FXO4LPUQPSK2Z6CQAQXH5AKL6Y5NX4TBCF")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brass underline underline-offset-2 hover:text-white"
                >
                  SDF Stellar Lab ↗
                </a>
              </div>
            </div>

            <div className="bg-raised border border-white/10 p-4 rounded-xl text-canvas space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-brass font-semibold">EURC SEP-41 SAC Contract</span>
                <span className="text-action">PROVISIONED</span>
              </div>
              <div className="font-mono text-xs text-white/90 truncate bg-black/40 p-2 rounded border border-white/5">
                CBESXK3KRJKX7FI6HJQEY26KQ3ZYRFNDG3IICYOMGMJHLLFCCKZNV3DS
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <a
                  href={stellarExpertContractUrl("CBESXK3KRJKX7FI6HJQEY26KQ3ZYRFNDG3IICYOMGMJHLLFCCKZNV3DS")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-action underline underline-offset-2 hover:text-white"
                >
                  Inspect SAC Token on Explorer ↗
                </a>
              </div>
            </div>

            <div className="bg-raised border border-white/10 p-4 rounded-xl text-canvas space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-brass font-semibold">USDC SEP-41 SAC Contract</span>
                <span className="text-action">PROVISIONED</span>
              </div>
              <div className="font-mono text-xs text-white/90 truncate bg-black/40 p-2 rounded border border-white/5">
                CCVE7CGVRI5T5S6GXSLRAVEYCA2XZIWHJJ7IVGTUVW6DOD2R34VDAX6K
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <a
                  href={stellarExpertContractUrl("CCVE7CGVRI5T5S6GXSLRAVEYCA2XZIWHJJ7IVGTUVW6DOD2R34VDAX6K")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-action underline underline-offset-2 hover:text-white"
                >
                  Inspect SAC Token on Explorer ↗
                </a>
              </div>
            </div>
          </div>

          {/* Test Metrics Strip */}
          <div className="bg-canvas border border-white/10 p-4 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
            <div>
              <div className="text-xl font-bold text-action">5 / 5</div>
              <div className="text-[10px] text-white/60 uppercase">E2E Tests Passing</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">43</div>
              <div className="text-[10px] text-white/60 uppercase">On-Chain Assertions</div>
            </div>
            <div>
              <div className="text-xl font-bold text-brass">2,000,000</div>
              <div className="text-[10px] text-white/60 uppercase">SDEX Pool Depth</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">&lt; 3.5s</div>
              <div className="text-[10px] text-white/60 uppercase">Mean Settlement</div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLIDE 7: Market Opportunity & MiCA Tailwinds
    // ----------------------------------------------------
    {
      number: "07",
      category: "MARKET OPPORTUNITY & REGULATORY TAILWINDS",
      title: "Market Opportunity: $14.2T Volume & MiCA Tailwinds",
      subtitle:
        "Regulatory clarity across Europe combined with the explosion of autonomous AI agents creates an unprecedented market timing.",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-raised border border-white/10 rounded-[var(--radius-card)] p-6 text-canvas">
              <div className="text-2xl font-bold text-action font-mono mb-1">$14.2T</div>
              <h4 className="font-bold text-white text-sm mb-2">European Treasury TAM</h4>
              <p className="text-xs text-white/70 leading-relaxed">
                European cross-border commercial transactions volume. Software and cloud subscriptions represent over $220B in recurring transatlantic dollar spend.
              </p>
            </div>

            <div className="bg-raised border border-white/10 rounded-[var(--radius-card)] p-6 text-canvas">
              <div className="text-2xl font-bold text-brass font-mono mb-1">MiCA Compliant</div>
              <h4 className="font-bold text-white text-sm mb-2">Electronic Money Tokens</h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Circle’s EURC operates under full EU MiCA Electronic Money Token (EMT) issuance. European enterprises hold fully backed, audited euro stablecoins on Stellar.
              </p>
            </div>

            <div className="bg-raised border border-white/10 rounded-[var(--radius-card)] p-6 text-canvas">
              <div className="text-2xl font-bold text-white font-mono mb-1">15 Billion+</div>
              <h4 className="font-bold text-white text-sm mb-2">Machine Agent Identities</h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Gartner forecasts &gt;15 billion autonomous machine agents by 2028. Agentic workflows require JIT micropayment channels (x402) rather than credit cards.
              </p>
            </div>
          </div>

          {/* Unit Economics Highlight */}
          <div className="bg-canvas border border-brass/30 rounded-xl p-5 text-canvas">
            <div className="text-xs font-mono text-brass font-semibold uppercase mb-2">
              Representative Enterprise ROI Model (Mid-Market SaaS firm with €5M overseas spend):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-white/5 p-3 rounded">
                <span className="text-white/60 block">FX Fee Recovery:</span>
                <span className="text-sm font-bold text-action">+$125,000 / year</span>
              </div>
              <div className="bg-white/5 p-3 rounded">
                <span className="text-white/60 block">Unlocked Idle Cash:</span>
                <span className="text-sm font-bold text-white">+$350,000 liquidity</span>
              </div>
              <div className="bg-white/5 p-3 rounded">
                <span className="text-white/60 block">Finance Ops Overhead:</span>
                <span className="text-sm font-bold text-brass">-80% manual hours</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLIDE 8: Continuation Roadmap
    // ----------------------------------------------------
    {
      number: "08",
      category: "COMMERCIAL ROADMAP & SCF BUILD AWARD",
      title: "Continuation Roadmap: Scaling to Production ($150k SCF)",
      subtitle:
        "Structured execution tranches taking Portus from HackMeridian Genesis MVP into European institutional production.",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tranche 1 */}
            <div className="bg-action-deep/40 border border-action p-5 rounded-xl text-canvas flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-action mb-2 font-semibold">
                  <span>TRANCHE 1</span>
                  <span>COMPLETED</span>
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">HackMeridian Genesis MVP</h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  Stellar Protocol 29 Core Engine, EURC Soroban Vault, Native SDEX path payments, CAP-0085 Fleet, CAP-0086 Sparse Policies, x402 v2, and CFO Passkeys.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/10 text-[10px] font-mono text-action">
                ✓ Live & Tested on Testnet
              </div>
            </div>

            {/* Tranche 2 */}
            <div className="bg-raised border border-white/10 p-5 rounded-xl text-canvas flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-brass mb-2 font-semibold">
                  <span>TRANCHE 2</span>
                  <span>Q4 2026</span>
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">European Anchor Rails</h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  Direct SEP-24 / SEP-31 integration with licensed European SEPA anchors (MYKOBO, Circle EURC minting) and SEPA Instant virtual IBAN accounts.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/10 text-[10px] font-mono text-white/50">
                Target: Fiat On/Off-Ramps
              </div>
            </div>

            {/* Tranche 3 */}
            <div className="bg-raised border border-white/10 p-5 rounded-xl text-canvas flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-brass mb-2 font-semibold">
                  <span>TRANCHE 3</span>
                  <span>Q1 2027</span>
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">Threshold Multi-Sig & ZK</h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  M-of-N hardware passkey CFO quorums and zero-knowledge shielded balance proofs for executive payroll and supplier privacy.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/10 text-[10px] font-mono text-white/50">
                Target: Confidential Settlement
              </div>
            </div>

            {/* Tranche 4 */}
            <div className="bg-raised border border-white/10 p-5 rounded-xl text-canvas flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-brass mb-2 font-semibold">
                  <span>TRANCHE 4</span>
                  <span>Q2 2027</span>
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">Enterprise ERP Connectors</h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  Bi-directional sync connectors for SAP S/4HANA, NetSuite, and Workday with automated general-ledger reconciliation and Mainnet rollout.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/10 text-[10px] font-mono text-white/50">
                Target: Mainnet Commercial Scale
              </div>
            </div>
          </div>

          {/* Final Callout Banner */}
          <div className="bg-canvas border border-action/40 rounded-xl p-5 text-canvas flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-white">
                Ready for Stellar Community Fund Continuation
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                Portus transforms Stellar into the financial clearinghouse for the next generation of European enterprises.
              </p>
            </div>
            <Link
              href="/#cockpit"
              data-magnetic="0.2"
              className="inline-flex items-center gap-2 min-h-8 py-2.5 px-5 rounded-md bg-action-deep hover:bg-action-deep text-white text-xs font-semibold whitespace-nowrap shadow-md transition-all focus-visible:outline-2 focus-visible:outline-action-deep"
            >
              <span>Launch Live Testnet Cockpit</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const activeSlide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-canvas text-canvas flex flex-col selection:bg-action-deep selection:text-white">
      {/* Top Deck Navigation Bar */}
      <header className="sticky top-0 z-30 w-full bg-canvas/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Back Link & Brand */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 min-h-8 py-1.5 px-3 rounded-md text-xs font-mono text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-brass"
          >
            <span aria-hidden="true">←</span>
            <span>Back to Live Cockpit</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-brass">
            <span className="font-semibold">PORTUS PITCH DECK</span>
            <span className="text-white/40">/</span>
            <span className="text-white/80">{activeSlide.category}</span>
          </div>
        </div>

        {/* Right: Testnet Status & Keyboard Hints */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 text-white/60 border border-white/10">
            <span>Keys:</span>
            <kbd className="px-1 py-0.5 rounded bg-black/40 text-brass border border-white/10 text-[10px]">
              ←
            </kbd>
            <kbd className="px-1 py-0.5 rounded bg-black/40 text-brass border border-white/10 text-[10px]">
              →
            </kbd>
            <kbd className="px-1 py-0.5 rounded bg-black/40 text-brass border border-white/10 text-[10px]">
              Space
            </kbd>
          </div>

          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-action-deep/20 border border-action-deep/40 text-action text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-action animate-pulse" />
            <span>Testnet Live</span>
          </div>
        </div>
      </header>

      {/* Main Slide Presentation Stage */}
      <main
        id="deck-stage"
        role="region"
        aria-roledescription="slide"
        aria-label={`Slide ${currentSlide + 1} of ${TOTAL_SLIDES}: ${activeSlide.title}`}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center"
      >
        {/* Slide Header */}
        <div className="mb-6 sm:mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-brass font-semibold tracking-wider">
              {activeSlide.category}
            </span>
            <span className="text-white/60 tabular-nums">
              SLIDE {activeSlide.number} / {String(TOTAL_SLIDES).padStart(2, "0")}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-[1.15]">
            {activeSlide.title}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-white/75 max-w-4xl leading-relaxed">
            {activeSlide.subtitle}
          </p>
        </div>

        {/* Dynamic Slide Body */}
        <div className="transition-opacity duration-200 ease-in-out">
          {activeSlide.content}
        </div>
      </main>

      {/* Persistent Bottom Deck Dock & Slide Scrubber */}
      <footer className="sticky bottom-0 z-30 w-full bg-canvas/95 backdrop-blur-md border-t border-white/10">
        {/* Progress Bar Line */}
        <div className="w-full h-1 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-action-deep via-action to-brass transition-all duration-300 ease-out"
            style={{ width: `${((currentSlide + 1) / TOTAL_SLIDES) * 100}%` }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Slide Indicator & Scrubber Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
            {slides.map((s, idx) => (
              <button
                key={s.number}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Jump to slide ${s.number}: ${s.title}`}
                className={`min-h-8 px-2 sm:px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all focus-visible:outline-2 focus-visible:outline-brass ${
                  currentSlide === idx
                    ? "bg-brass text-canvas shadow-sm"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {s.number}
              </button>
            ))}
          </div>

          {/* Previous / Next Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              data-magnetic="0.15"
              className="inline-flex items-center gap-1.5 min-h-8 py-2 px-3 sm:px-4 rounded-md text-xs font-semibold text-white/90 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus-visible:outline-2 focus-visible:outline-brass active:scale-[0.98]"
            >
              <span aria-hidden="true">←</span>
              <span>Previous</span>
            </button>

            <span className="text-xs font-mono text-white/60 tabular-nums px-1">
              {activeSlide.number} / {String(TOTAL_SLIDES).padStart(2, "0")}
            </span>

            <button
              type="button"
              onClick={nextSlide}
              disabled={currentSlide === TOTAL_SLIDES - 1}
              data-magnetic="0.15"
              className="inline-flex items-center gap-1.5 min-h-8 py-2 px-3 sm:px-4 rounded-md text-xs font-semibold text-white bg-action-deep hover:bg-action-deep disabled:opacity-40 disabled:cursor-not-allowed transition-all focus-visible:outline-2 focus-visible:outline-brass active:scale-[0.98]"
            >
              <span>Next</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
