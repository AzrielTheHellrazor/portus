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
    <div className="w-full py-16 md:py-24 bg-[#F6F5F1] text-[#0C0F14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="mb-12 pb-8 border-b border-[rgba(12,15,20,0.11)]">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#4A5260] mb-3">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center min-h-8 py-1 px-1.5 rounded hover:text-[#0C0F14] transition-colors focus-visible:outline-2 focus-visible:outline-[#0B3B2C]"
              >
                Portus
              </Link>
              <span>/</span>
              <span className="text-[#0B3B2C] font-semibold">Technical Architecture</span>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 min-h-8 py-1 px-2.5 rounded text-xs font-semibold text-[#0B3B2C] bg-[#0B3B2C]/10 hover:bg-[#0B3B2C]/15 transition-all focus-visible:outline-2 focus-visible:outline-[#0B3B2C]"
            >
              <span aria-hidden="true">←</span>
              <span>Back to Live Cockpit</span>
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B3B2C]/10 border border-[#0B3B2C]/20 text-[#0B3B2C] text-xs font-mono font-medium tracking-wide uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0B3B2C]" />
            <span>HACKMERIDIAN 2026 · ARCHITECTURAL SPECIFICATION</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0C0F14] leading-[1.1]">
            Dual-Track Protocol Alignment & Technical Architecture
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#4A5260] max-w-3xl leading-relaxed">
            A comprehensive reference for HackMeridian judges, illustrating how Portus satisfies every criterion of
            both the <strong className="text-[#0C0F14]">Stellar Unlocked</strong> and{" "}
            <strong className="text-[#0C0F14]">Stellar Composed</strong> hackathon tracks.
          </p>
        </div>

        {/* 1. END-TO-END SEQUENCE DIAGRAM (Responsive Structured Visual Diagram) */}
        <section className="mb-16">
          <div className="mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-[#785316] font-semibold block">
              Execution Architecture
            </span>
            <h2 className="text-2xl font-bold text-[#0C0F14] tracking-tight">
              End-to-End Clearing & Settlement Sequence
            </h2>
          </div>

          <div className="bg-white border border-[rgba(12,15,20,0.11)] rounded-2xl p-6 sm:p-8 shadow-xs">
            {/* Visual Flow Stages */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Stage 1 */}
              <div className="p-4 rounded-xl bg-[#F6F5F1] border border-[rgba(12,15,20,0.08)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-[#0B3B2C] font-bold">STAGE 01</span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-black/10">
                      CLIENT / SPENDER
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0C0F14] mb-1">
                    Card Spend or HTTP 402 Request
                  </h3>
                  <p className="text-xs text-[#4A5260] leading-relaxed">
                    A corporate employee card charges a $125 US invoice or an autonomous AI bot accesses a $2 paywalled market intelligence feed.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-black/10 text-[11px] font-mono text-[#646D7C]">
                  Trigger: Client Signature
                </div>
              </div>

              {/* Stage 2 */}
              <div className="p-4 rounded-xl bg-[#0C0F14] text-[#F6F5F1] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-[#D4A24C] font-bold">STAGE 02</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white font-semibold">
                      SOROBAN VM
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    CAP-0086 Policy Guard Verification
                  </h3>
                  <p className="text-xs text-white/75 leading-relaxed">
                    Soroban evaluates on-chain policy: spender address, allowed merchant whitelist, daily spend cap, and OpenZeppelin Pausable status.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-[#D4A24C]">
                  Revert: 0 EURC Leaked if Invalid
                </div>
              </div>

              {/* Stage 3 */}
              <div className="p-4 rounded-xl bg-[#F6F5F1] border border-[rgba(12,15,20,0.08)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-[#065F46] font-bold">STAGE 03</span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-black/10">
                      STELLAR SDEX
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0C0F14] mb-1">
                    Atomic pathPaymentStrictReceive
                  </h3>
                  <p className="text-xs text-[#4A5260] leading-relaxed">
                    Stellar native orderbook converts exact EURC reserve needed to deliver exact USDC required with zero idle prefunded float.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-black/10 text-[11px] font-mono text-[#065F46] font-semibold">
                  Protocol: Native DEX Orderbook
                </div>
              </div>

              {/* Stage 4 */}
              <div className="p-4 rounded-xl bg-[#065F46]/10 border border-[#065F46]/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-[#065F46] font-bold">STAGE 04</span>
                    <span className="text-[10px] bg-[#065F46] hover:bg-[#047857] text-white px-2 py-0.5 rounded font-semibold">
                      FINAL SETTLEMENT
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0C0F14] mb-1">
                    Vendor Receipt & x402 Unlock
                  </h3>
                  <p className="text-xs text-[#4A5260] leading-relaxed">
                    Vendor receives USDC instantly. Autonomous agent provides settlement tx hash to receive HTTP 200 OK macro intelligence payload.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#065F46]/20 text-[11px] font-mono text-[#065F46] font-semibold">
                  Confirmed: 1 Ledger (~4s)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. DUAL-TRACK ALIGNMENT MATRIX */}
        <section className="mb-16">
          <div className="mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-[#0B3B2C] font-semibold block">
              Hackathon Evaluation Matrix
            </span>
            <h2 className="text-2xl font-bold text-[#0C0F14] tracking-tight">
              Dual-Track Alignment Matrix
            </h2>
          </div>

          <div className="space-y-8">
            {/* Track 1: Stellar Unlocked */}
            <div className="bg-white border border-[rgba(12,15,20,0.11)] rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[rgba(12,15,20,0.08)]">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#0B3B2C] font-bold">
                    TRACK 1
                  </span>
                  <h3 className="text-xl font-bold text-[#0C0F14] tracking-tight">
                    {ALIGNMENT_TRACKS.unlocked.title}
                  </h3>
                </div>
                <span className="text-xs text-[#4A5260] mt-1 sm:mt-0 font-medium">
                  {ALIGNMENT_TRACKS.unlocked.subtitle}
                </span>
              </div>

              <div className="overflow-x-auto" data-lenis-prevent>
                <table className="w-full text-left text-xs font-mono min-w-[640px]">
                  <thead>
                    <tr className="border-b border-[rgba(12,15,20,0.10)] text-[#646D7C]">
                      <th className="pb-3 pr-4 font-semibold uppercase tracking-wider">Feature</th>
                      <th className="pb-3 pr-4 font-semibold uppercase tracking-wider">Primitive</th>
                      <th className="pb-3 pr-4 font-semibold uppercase tracking-wider">File Reference</th>
                      <th className="pb-3 font-semibold uppercase tracking-wider">On-Chain Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(12,15,20,0.06)]">
                    {ALIGNMENT_TRACKS.unlocked.items.map((item) => (
                      <tr key={item.feature} className="hover:bg-[#F6F5F1]/50 transition-colors">
                        <td className="py-3.5 pr-4 font-bold text-[#0C0F14] font-sans text-sm">
                          {item.feature}
                        </td>
                        <td className="py-3.5 pr-4 text-[#0B3B2C] font-semibold">
                          {item.primitive}
                        </td>
                        <td className="py-3.5 pr-4 text-[#4A5260]">
                          <code className="bg-black/[0.05] px-1.5 py-0.5 rounded text-[11px]">
                            {item.fileReference}
                          </code>
                        </td>
                        <td className="py-3.5 text-[#4A5260] font-sans text-xs">
                          {item.onChainProof}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Track 2: Stellar Composed */}
            <div className="bg-white border border-[rgba(12,15,20,0.11)] rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[rgba(12,15,20,0.08)]">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#785316] font-bold">
                    TRACK 2
                  </span>
                  <h3 className="text-xl font-bold text-[#0C0F14] tracking-tight">
                    {ALIGNMENT_TRACKS.composed.title}
                  </h3>
                </div>
                <span className="text-xs text-[#4A5260] mt-1 sm:mt-0 font-medium">
                  {ALIGNMENT_TRACKS.composed.subtitle}
                </span>
              </div>

              <div className="overflow-x-auto" data-lenis-prevent>
                <table className="w-full text-left text-xs font-mono min-w-[640px]">
                  <thead>
                    <tr className="border-b border-[rgba(12,15,20,0.10)] text-[#646D7C]">
                      <th className="pb-3 pr-4 font-semibold uppercase tracking-wider">Feature</th>
                      <th className="pb-3 pr-4 font-semibold uppercase tracking-wider">Primitive</th>
                      <th className="pb-3 pr-4 font-semibold uppercase tracking-wider">File Reference</th>
                      <th className="pb-3 font-semibold uppercase tracking-wider">On-Chain Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(12,15,20,0.06)]">
                    {ALIGNMENT_TRACKS.composed.items.map((item) => (
                      <tr key={item.feature} className="hover:bg-[#F6F5F1]/50 transition-colors">
                        <td className="py-3.5 pr-4 font-bold text-[#0C0F14] font-sans text-sm">
                          {item.feature}
                        </td>
                        <td className="py-3.5 pr-4 text-[#785316] font-semibold">
                          {item.primitive}
                        </td>
                        <td className="py-3.5 pr-4 text-[#4A5260]">
                          <code className="bg-black/[0.05] px-1.5 py-0.5 rounded text-[11px]">
                            {item.fileReference}
                          </code>
                        </td>
                        <td className="py-3.5 text-[#4A5260] font-sans text-xs">
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
            <span className="text-xs font-mono uppercase tracking-wider text-[#0B3B2C] font-semibold block">
              Market Positioning
            </span>
            <h2 className="text-2xl font-bold text-[#0C0F14] tracking-tight">
              Why Portus vs. Existing Corporate & Agent Wallets
            </h2>
          </div>

          <div className="bg-white border border-[rgba(12,15,20,0.11)] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="overflow-x-auto" data-lenis-prevent>
              <table className="w-full text-left text-xs font-mono min-w-[700px]">
                <thead>
                  <tr className="border-b border-[rgba(12,15,20,0.10)] text-[#646D7C]">
                    <th className="pb-3 pr-4 font-semibold uppercase tracking-wider w-1/4">Dimension</th>
                    <th className="pb-3 pr-4 font-semibold uppercase tracking-wider w-3/8 text-[#B91C1C]">
                      Traditional / Pre-funded Architecture
                    </th>
                    <th className="pb-3 font-semibold uppercase tracking-wider w-3/8 text-[#0B3B2C]">
                      Portus Sovereign Clearinghouse
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(12,15,20,0.06)]">
                  {COMPARISON_TABLE.map((row) => (
                    <tr key={row.dimension} className="hover:bg-[#F6F5F1]/50 transition-colors">
                      <td className="py-4 pr-4 font-bold text-[#0C0F14] font-sans text-sm">
                        {row.dimension}
                      </td>
                      <td className="py-4 pr-4 text-[#4A5260] font-sans text-xs">
                        {row.traditional}
                      </td>
                      <td className="py-4 text-[#0B3B2C] font-sans text-xs font-medium bg-[#0B3B2C]/[0.02] px-2 rounded">
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
            <span className="text-xs font-mono uppercase tracking-wider text-[#785316] font-semibold block">
              Production Viability
            </span>
            <h2 className="text-2xl font-bold text-[#0C0F14] tracking-tight">
              Stellar Community Fund (SCF) Continuation Roadmap
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ROADMAP_TRANCHES.map((tranche) => (
              <div
                key={tranche.tranche}
                className="bg-white border border-[rgba(12,15,20,0.11)] rounded-2xl p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-[#785316] font-bold">{tranche.tranche}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        tranche.status.includes("Completed")
                          ? "bg-[#065F46]/10 text-[#065F46]"
                          : "bg-black/5 text-[#4A5260]"
                      }`}
                    >
                      {tranche.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0C0F14] mb-2 font-sans">
                    {tranche.milestone}
                  </h3>
                  <p className="text-xs text-[#4A5260] leading-relaxed">
                    {tranche.deliverables}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Back Link */}
        <div className="pt-8 border-t border-[rgba(12,15,20,0.11)] flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B3B2C] hover:text-[#12543F] min-h-8 py-2 px-3 rounded-md transition-all scroll-mt-24 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B3B2C]"
          >
            <span aria-hidden="true">←</span>
            <span>Return to Live Treasury Vault Cockpit</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
