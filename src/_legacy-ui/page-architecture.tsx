import type { Metadata } from "next";
import Link from "next/link";
import { ALIGNMENT_TRACKS, COMPARISON_TABLE, ROADMAP_TRANCHES } from "@/data/site";

export const metadata: Metadata = {
  title: "Protocol Architecture & Track Alignment",
  description:
    "Technical specification of Portus on Stellar Testnet: Soroban CAP-0085/CAP-0086, Native SDEX path payments, x402 v2 channels, and secp256r1 Passkeys.",
};

export default function ArchitecturePage() {
  return (
    <div className="w-full py-16 md:py-24 bg-canvas text-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="mb-12 pb-8 border-b border-hairline">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-text-2 mb-3">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center min-h-8 py-1 px-1.5 rounded hover:text-canvas transition-colors focus-visible:outline-2 focus-visible:outline-action-deep"
              >
                Portus
              </Link>
              <span>/</span>
              <span className="text-action-deep font-semibold">Technical Architecture</span>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 min-h-8 py-1 px-2.5 rounded text-xs font-semibold text-action-deep bg-action-deep/10 hover:bg-action-deep/15 transition-all focus-visible:outline-2 focus-visible:outline-action-deep"
            >
              <span aria-hidden="true">←</span>
              <span>Back to Live Cockpit</span>
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-action-deep/10 border border-action-deep/20 text-action-deep text-xs font-mono font-medium tracking-wide uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-action-deep" />
            <span>HACKMERIDIAN 2026 · ARCHITECTURAL SPECIFICATION</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[480] tracking-tight text-canvas leading-[1.1]">
            Dual-Track Protocol Alignment & Technical Architecture
          </h1>

          <p className="mt-4 text-base sm:text-lg text-text-2 max-w-3xl leading-relaxed font-[380]">
            A comprehensive reference for HackMeridian judges, illustrating how Portus satisfies every criterion of
            both the <strong className="text-canvas font-[480]">Stellar Unlocked</strong> and{" "}
            <strong className="text-canvas font-[480]">Stellar Composed</strong> hackathon tracks.
          </p>
        </div>

        {/* 1. END-TO-END SEQUENCE DIAGRAM (Responsive Structured Visual Diagram) */}
        <section className="mb-16">
          <div className="mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-brass font-[500] block">
              Execution Architecture
            </span>
            <h2 className="text-2xl font-[480] text-canvas tracking-tight">
              End-to-End Clearing & Settlement Sequence
            </h2>
          </div>

          <div className="bg-white border border-hairline rounded-[var(--radius-card)] p-6 sm:p-8 shadow-xs">
            {/* Visual Flow Stages */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Stage 1 */}
              <div className="p-4 rounded-xl bg-canvas border border-hairline flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-action-deep font-bold">STAGE 01</span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-black/10">
                      CLIENT / SPENDER
                    </span>
                  </div>
                  <h3 className="text-sm font-[480] text-canvas mb-1">
                    Card Spend or HTTP 402 Request
                  </h3>
                  <p className="text-xs text-text-2 leading-relaxed font-[380]">
                    A corporate employee card charges a $125 US invoice or an autonomous AI bot accesses a $2 paywalled market intelligence feed.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-black/10 text-[11px] font-mono text-text-3">
                  Trigger: Client Signature
                </div>
              </div>

              {/* Stage 2 */}
              <div className="p-4 rounded-xl bg-canvas text-canvas border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-brass font-bold">STAGE 02</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white font-[420]">
                      SOROBAN VM
                    </span>
                  </div>
                  <h3 className="text-sm font-[480] text-white mb-1">
                    CAP-0086 Policy Guard Verification
                  </h3>
                  <p className="text-xs text-white/75 leading-relaxed font-[380]">
                    Soroban evaluates on-chain policy: spender address, allowed merchant whitelist, daily spend cap, and OpenZeppelin Pausable status.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-brass">
                  Revert: 0 EURC Leaked if Invalid
                </div>
              </div>

              {/* Stage 3 */}
              <div className="p-4 rounded-xl bg-canvas border border-hairline flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-action-deep font-bold">STAGE 03</span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-black/10">
                      STELLAR SDEX
                    </span>
                  </div>
                  <h3 className="text-sm font-[480] text-canvas mb-1">
                    Atomic pathPaymentStrictReceive
                  </h3>
                  <p className="text-xs text-text-2 leading-relaxed font-[380]">
                    Stellar native orderbook converts exact EURC reserve needed to deliver exact USDC required with zero idle prefunded float.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-black/10 text-[11px] font-mono text-action-deep font-[420]">
                  Protocol: Native DEX Orderbook
                </div>
              </div>

              {/* Stage 4 */}
              <div className="p-4 rounded-xl bg-action-deep/10 border border-action-deep/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-action-deep font-bold">STAGE 04</span>
                    <span className="text-[10px] bg-action-deep hover:bg-action-deep text-white px-2 py-0.5 rounded font-[420]">
                      FINAL SETTLEMENT
                    </span>
                  </div>
                  <h3 className="text-sm font-[480] text-canvas mb-1">
                    Vendor Receipt & x402 Unlock
                  </h3>
                  <p className="text-xs text-text-2 leading-relaxed font-[380]">
                    Vendor receives USDC instantly. Autonomous agent provides settlement tx hash to receive HTTP 200 OK macro intelligence payload.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-action-deep/20 text-[11px] font-mono text-action-deep font-[420]">
                  Confirmed: 1 Ledger (~4s)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. DUAL-TRACK ALIGNMENT MATRIX */}
        <section className="mb-16">
          <div className="mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-action-deep font-[500] block">
              Hackathon Evaluation Matrix
            </span>
            <h2 className="text-2xl font-[480] text-canvas tracking-tight">
              Dual-Track Alignment Matrix
            </h2>
          </div>

          <div className="space-y-8">
            {/* Track 1: Stellar Unlocked */}
            <div className="bg-white border border-hairline rounded-[var(--radius-card)] p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-hairline">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-action-deep font-[500]">
                    TRACK 1
                  </span>
                  <h3 className="text-xl font-[480] text-canvas tracking-tight">
                    {ALIGNMENT_TRACKS.unlocked.title}
                  </h3>
                </div>
                <span className="text-xs text-text-2 mt-1 sm:mt-0 font-[420]">
                  {ALIGNMENT_TRACKS.unlocked.subtitle}
                </span>
              </div>

              <div className="overflow-x-auto" data-lenis-prevent>
                <table className="w-full text-left text-xs font-mono min-w-[640px]">
                  <thead>
                    <tr className="border-b border-hairline text-text-3">
                      <th className="pb-3 pr-4 font-[500] uppercase tracking-wider">Feature</th>
                      <th className="pb-3 pr-4 font-[500] uppercase tracking-wider">Primitive</th>
                      <th className="pb-3 pr-4 font-[500] uppercase tracking-wider">File Reference</th>
                      <th className="pb-3 font-[500] uppercase tracking-wider">On-Chain Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {ALIGNMENT_TRACKS.unlocked.items.map((item) => (
                      <tr key={item.feature} className="hover:bg-canvas/50 transition-colors">
                        <td className="py-3.5 pr-4 font-[480] text-canvas font-sans text-sm">
                          {item.feature}
                        </td>
                        <td className="py-3.5 pr-4 text-action-deep font-[420]">
                          {item.primitive}
                        </td>
                        <td className="py-3.5 pr-4 text-text-2">
                          <code className="bg-black/[0.05] px-1.5 py-0.5 rounded text-[11px]">
                            {item.fileReference}
                          </code>
                        </td>
                        <td className="py-3.5 text-text-2 font-sans text-xs font-[380]">
                          {item.onChainProof}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Track 2: Stellar Composed */}
            <div className="bg-white border border-hairline rounded-[var(--radius-card)] p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-hairline">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-brass font-[500]">
                    TRACK 2
                  </span>
                  <h3 className="text-xl font-[480] text-canvas tracking-tight">
                    {ALIGNMENT_TRACKS.composed.title}
                  </h3>
                </div>
                <span className="text-xs text-text-2 mt-1 sm:mt-0 font-[420]">
                  {ALIGNMENT_TRACKS.composed.subtitle}
                </span>
              </div>

              <div className="overflow-x-auto" data-lenis-prevent>
                <table className="w-full text-left text-xs font-mono min-w-[640px]">
                  <thead>
                    <tr className="border-b border-hairline text-text-3">
                      <th className="pb-3 pr-4 font-[500] uppercase tracking-wider">Feature</th>
                      <th className="pb-3 pr-4 font-[500] uppercase tracking-wider">Primitive</th>
                      <th className="pb-3 pr-4 font-[500] uppercase tracking-wider">File Reference</th>
                      <th className="pb-3 font-[500] uppercase tracking-wider">On-Chain Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {ALIGNMENT_TRACKS.composed.items.map((item) => (
                      <tr key={item.feature} className="hover:bg-canvas/50 transition-colors">
                        <td className="py-3.5 pr-4 font-[480] text-canvas font-sans text-sm">
                          {item.feature}
                        </td>
                        <td className="py-3.5 pr-4 text-brass font-[420]">
                          {item.primitive}
                        </td>
                        <td className="py-3.5 pr-4 text-text-2">
                          <code className="bg-black/[0.05] px-1.5 py-0.5 rounded text-[11px]">
                            {item.fileReference}
                          </code>
                        </td>
                        <td className="py-3.5 text-text-2 font-sans text-xs font-[380]">
                          {item.onChainProof}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 3. WHY PORTUS VS EXISTING AGENT WALLETS */}
        <section className="mb-16">
          <div className="mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-action-deep font-[500] block">
              Market Positioning
            </span>
            <h2 className="text-2xl font-[480] text-canvas tracking-tight">
              Why Portus vs. Existing Corporate & Agent Wallets
            </h2>
          </div>

          <div className="bg-white border border-hairline rounded-[var(--radius-card)] p-6 sm:p-8 shadow-xs">
            <div className="overflow-x-auto" data-lenis-prevent>
              <table className="w-full text-left text-xs font-mono min-w-[700px]">
                <thead>
                  <tr className="border-b border-hairline text-text-3">
                    <th className="pb-3 pr-4 font-[500] uppercase tracking-wider w-1/4">Dimension</th>
                    <th className="pb-3 pr-4 font-[500] uppercase tracking-wider w-3/8 text-status-error">
                      Traditional / Pre-funded Architecture
                    </th>
                    <th className="pb-3 font-[500] uppercase tracking-wider w-3/8 text-action-deep">
                      Portus Sovereign Clearinghouse
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {COMPARISON_TABLE.map((row) => (
                    <tr key={row.dimension} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-4 pr-4 font-[480] text-canvas font-sans text-sm">
                        {row.dimension}
                      </td>
                      <td className="py-4 pr-4 text-text-2 font-sans text-xs">
                        {row.traditional}
                      </td>
                      <td className="py-4 text-action-deep font-sans text-xs font-[420] bg-action-deep/[0.02] px-2 rounded">
                        {row.portus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4. CONTINUATION ROADMAP (SCF Build Award Tranches 1-4) */}
        <section className="mb-16">
          <div className="mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-brass font-[500] block">
              Production Viability
            </span>
            <h2 className="text-2xl font-[480] text-canvas tracking-tight">
              Stellar Community Fund (SCF) Continuation Roadmap
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ROADMAP_TRANCHES.map((tranche) => (
              <div
                key={tranche.tranche}
                className="bg-white border border-hairline rounded-[var(--radius-card)] p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-brass font-bold">{tranche.tranche}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-[420] ${
                        tranche.status.includes("Completed")
                          ? "bg-action-deep/10 text-action-deep"
                          : "bg-black/5 text-text-2"
                      }`}
                    >
                      {tranche.status}
                    </span>
                  </div>
                  <h3 className="text-base font-[480] text-canvas mb-2 font-sans">
                    {tranche.milestone}
                  </h3>
                  <p className="text-xs text-text-2 leading-relaxed">
                    {tranche.deliverables}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Back Link */}
        <div className="pt-8 border-t border-hairline flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-[420] text-action-deep hover:text-action-deep min-h-8 py-2 px-3 rounded-md transition-all scroll-mt-24 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action-deep"
          >
            <span aria-hidden="true">←</span>
            <span>Return to Live Treasury Vault Cockpit</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
