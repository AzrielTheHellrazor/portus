"use client";

import type { SubsidiaryVaultRecord } from "@/types/treasury";
import { INITIAL_FLEET } from "@/data/site";
import { stellarLabContractUrl, stellarExpertContractUrl } from "./stellar-lab";

interface FleetGridProps {
  fleet?: SubsidiaryVaultRecord[];
  factoryContractId?: string;
  wasmHash?: string;
}

export function FleetGrid({
  fleet = INITIAL_FLEET,
  factoryContractId = "CC2Q2JLSIHMIXS4VQMNG57FXO4LPUQPSK2Z6CQAQXH5AKL6Y5NX4TBCF",
  wasmHash = "55be053e80de94bd6935d66b36e26f0bc2543e752a0e9b06244e355519c80674",
}: FleetGridProps) {
  return (
    <section id="fleet" className="w-full py-16 md:py-24 bg-[#F6F5F1] border-b border-[rgba(12,15,20,0.11)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-[rgba(12,15,20,0.11)]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#0B3B2C]/10 text-[#0B3B2C] text-xs font-mono font-medium uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B3B2C]" />
              ACT IV · SUBSIDIARY ARCHITECTURE
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0C0F14] tracking-tight">
              CAP-0085 Subsidiary Treasury Fleet
            </h2>
            <p className="text-sm text-[#4A5260] mt-1 max-w-2xl">
              European multinationals scale regional operating entities without bytecode bloat.
              The Portus Factory deploys regional vaults that reference a single shared executable Wasm tag
              (<code className="text-[#0C0F14]">v1_vault</code>), reducing state storage fees by over 98%.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-2 text-xs font-mono text-[#0B3B2C]">
            <span className="font-semibold">Shared Bytecode Hash:</span>
            <span className="text-[#4A5260] truncate max-w-[140px] sm:max-w-[200px]">
              {wasmHash.slice(0, 16)}...
            </span>
          </div>
        </div>

        {/* Subsidiary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {fleet.map((vault) => (
            <div
              key={vault.subsidiaryCode}
              className="bg-white border border-[rgba(12,15,20,0.11)] rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#785316] font-semibold">
                      {vault.subsidiaryCode} · {vault.jurisdiction}
                    </span>
                    <h3 className="text-xl font-bold text-[#0C0F14] tracking-tight mt-0.5">
                      {vault.name}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#065F46]/10 text-[#065F46] text-xs font-mono font-semibold">
                    ACTIVE
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs my-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[rgba(12,15,20,0.06)] gap-2">
                    <span className="text-[#646D7C]">Vault Contract ID</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={stellarExpertContractUrl(vault.vaultAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0B3B2C] hover:text-[#12543F] font-semibold underline underline-offset-4 truncate max-w-[160px] inline-flex items-center min-h-8 py-1.5 px-2 rounded focus-visible:outline-2 focus-visible:outline-[#0B3B2C]"
                        title={vault.vaultAddress}
                      >
                        {vault.vaultAddress.slice(0, 12)}...{vault.vaultAddress.slice(-4)}
                        <span aria-hidden="true" className="ml-1">↗</span>
                      </a>
                      <a
                        href={stellarLabContractUrl(vault.vaultAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#785316] hover:text-[#0C0F14] font-semibold bg-[#785316]/10 hover:bg-[#785316]/20 inline-flex items-center min-h-8 py-1.5 px-2.5 rounded transition-all focus-visible:outline-2 focus-visible:outline-[#785316]"
                      >
                        <span>Stellar Lab</span>
                        <span aria-hidden="true" className="ml-1">↗</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[rgba(12,15,20,0.06)]">
                    <span className="text-[#646D7C]">CAP-0085 Executable Tag</span>
                    <span className="text-[#0C0F14] font-semibold">
                      {vault.executableTag} (Shared Wasm)
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <span className="text-[#646D7C]">Deployed Ledger</span>
                    <span className="text-[#0C0F14] tabular-nums">
                      #{vault.deployedLedger || 5381488}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[rgba(12,15,20,0.08)] flex items-center justify-between text-xs font-mono">
                <span className="text-[#4A5260]">Parent Factory:</span>
                <a
                  href={stellarLabContractUrl(factoryContractId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0C0F14] font-medium hover:text-[#785316] truncate max-w-[200px] inline-flex items-center min-h-8 py-1.5 px-2 rounded focus-visible:outline-2 focus-visible:outline-[#0B3B2C]"
                  title="Inspect Factory in Stellar Lab"
                >
                  {factoryContractId.slice(0, 14)}...
                  <span aria-hidden="true" className="ml-1 text-[10px] text-[#785316]">Lab ↗</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Value Callout Strip */}
        <div className="bg-[#FFFFFF] border border-[rgba(12,15,20,0.11)] rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div>
            <h4 className="font-bold text-[#0C0F14] font-sans text-sm mb-1">
              98% State Storage Reduction
            </h4>
            <p className="text-[#4A5260] leading-relaxed">
              Standard contract deployment duplicates full Wasm binaries for every entity.
              CAP-0085 stores bytecode once on Stellar; subsidiaries only instantiate persistent state keys.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-[#0C0F14] font-sans text-sm mb-1">
              Audited Single-Point Upgrades
            </h4>
            <p className="text-[#4A5260] leading-relaxed">
              When protocol audits yield version improvements, the factory updates the executable pointer tag.
              Subsidiaries adopt verified security patches without coordinating 50 individual migrations.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-[#0C0F14] font-sans text-sm mb-1">
              Regional Autonomy & Ringfencing
            </h4>
            <p className="text-[#4A5260] leading-relaxed">
              Each subsidiary maintains isolated spend policies, separate merchant whitelists, and local currency
              tax attribution while sharing audited group infrastructure.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
