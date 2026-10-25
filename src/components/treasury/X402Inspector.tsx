"use client";

import { useState } from "react";
import type { X402WireStep } from "@/types/treasury";
import { REFERENCE_X402_TRACE, REFERENCE_INTELLIGENCE_PAYLOAD } from "@/data/site";

interface X402InspectorProps {
  wireTrace?: X402WireStep[];
  intelligencePayload?: Record<string, unknown>;
}

export function X402Inspector({
  wireTrace = REFERENCE_X402_TRACE,
  intelligencePayload = REFERENCE_INTELLIGENCE_PAYLOAD,
}: X402InspectorProps) {
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const activeStep = wireTrace[selectedStepIndex] || wireTrace[0];

  return (
    <section id="x402-inspector" className="w-full py-16 md:py-24 bg-[#0C0F14] text-[#F6F5F1] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#065F46]/20 text-[#34D399] text-xs font-mono font-medium uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
              ACT III · PROTOCOL INSPECTOR
            </div>
            <h2 className="text-2xl sm:text-3xl font-[480] text-white tracking-tight">
              x402 v2 Wire Protocol & Macro Intelligence Terminal
            </h2>
            <p className="text-sm text-white/75 mt-1 max-w-xl font-[380]">
              Inspect the exact four-step HTTP 402 negotiation handshake, Soroban JIT policy authorization,
              and native DEX settlement delivering ECB synthetic liquidity feeds.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-2 text-xs font-mono text-[#34D399] bg-[#065F46]/20 px-3 py-1.5 rounded border border-[#065F46]/40">
            <span>RFC 9110 · @x402/stellar v2</span>
          </div>
        </div>

        {/* 4-Step Interactive Pipeline Flow Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {wireTrace.map((step, idx) => {
            const isSelected = selectedStepIndex === idx;
            return (
              <button
                key={step.step}
                onClick={() => setSelectedStepIndex(idx)}
                className={`text-left p-4 rounded-xl border transition-all focus-visible:outline-2 focus-visible:outline-[#34D399] ${
                  isSelected
                    ? "bg-white/10 border-[#34D399] text-white shadow-sm"
                    : "bg-white/[0.03] border-white/10 text-white/75 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className={isSelected ? "text-[#34D399] font-bold" : "text-white/75"}>
                    STEP 0{step.step}
                  </span>
                  {step.httpStatus && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        step.httpStatus === 402
                          ? "bg-[#D4A24C] text-[#0C0F14] font-bold"
                          : "bg-[#065F46] text-white font-bold"
                      }`}
                    >
                      HTTP {step.httpStatus}
                    </span>
                  )}
                  {step.direction === "VAULT_ONCHAIN" && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white font-[420]">
                      SOROBAN
                    </span>
                  )}
                  {step.direction === "SDEX_FX" && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#065F46]/20 text-[#34D399] font-[420]">
                      SDEX_SWAP
                    </span>
                  )}
                </div>
                <span className="block text-xs font-[420] line-clamp-2 leading-relaxed">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Terminal Inspection Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Step Inspector Details */}
          <div className="lg:col-span-7 bg-[#12161F] border border-white/10 rounded-[var(--radius-card)] p-6 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]" />
                <span className="text-xs font-mono text-white/75">
                  Step {activeStep.step} Detail: {activeStep.direction}
                </span>
              </div>
              <span className="text-xs font-mono text-[#34D399] font-[420]">
                Latency: {activeStep.durationMs || 35}ms
              </span>
            </div>

            {/* Headers Box */}
            {activeStep.headers && Object.keys(activeStep.headers).length > 0 && (
              <div className="mb-6">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/75 block mb-2 font-[500]">
                  HTTP Wire Headers
                </span>
                <div
                  data-lenis-prevent
                  className="bg-black/50 border border-white/10 rounded-lg p-3 font-mono text-xs text-white/90 overflow-x-auto max-h-36"
                >
                  {Object.entries(activeStep.headers).map(([k, v]) => (
                    <div key={k} className="py-0.5 flex gap-2">
                      <span className="text-[#34D399] shrink-0 font-[420]">{k}:</span>
                      <span className="text-white/90 break-all">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Decoded Payload Box */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/75 block mb-2 font-[500]">
                Decoded Execution Payload
              </span>
              <pre
                data-lenis-prevent
                className="bg-black/60 border border-white/10 rounded-lg p-4 font-mono text-xs text-[#34D399] overflow-x-auto max-h-60 leading-relaxed"
              >
                {JSON.stringify(activeStep.decodedPayload, null, 2)}
              </pre>
            </div>

            {/* On-Chain Transaction Hash If Present */}
            {activeStep.txHash && (
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-white/75">On-Chain Tx Hash:</span>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${activeStep.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center min-h-8 py-1.5 px-2 text-[#34D399] hover:underline truncate max-w-[260px] focus-visible:outline-2 focus-visible:outline-[#34D399]"
                >
                  {activeStep.txHash}
                </a>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Unlocked Macro Feed Viewer */}
          <div className="lg:col-span-5 bg-[#12161F] border border-white/10 rounded-[var(--radius-card)] p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <span className="text-xs font-mono uppercase tracking-wider text-[#D4A24C] font-[500]">
                Unlocked Macro Feed (200 OK)
              </span>
              <span className="text-[11px] font-mono text-[#34D399] bg-[#065F46]/20 px-2 py-0.5 rounded font-[420]">
                PAYMENT DELIVERED
              </span>
            </div>

            <p className="text-xs text-white/75 mb-4 leading-relaxed font-[380]">
              Autonomous agents subscribe to high-frequency European Central Bank & Fed liquidity feeds
              settled via micropayments without holding unhedged currency risk.
            </p>

            <pre
              data-lenis-prevent
              className="bg-black/60 border border-white/10 rounded-lg p-4 font-mono text-xs text-[#F6F5F1] overflow-x-auto max-h-72 leading-relaxed"
            >
              {JSON.stringify(intelligencePayload, null, 2)}
            </pre>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/75">
              <span>Settlement: $2.0000000 USDC</span>
              <span className="text-[#34D399] font-[420]">JIT from EURC Vault</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
