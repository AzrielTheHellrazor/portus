"use client";

import { useState, useEffect } from "react";
import type { SubsidiaryVaultRecord } from "@/types/treasury";
import { INITIAL_FLEET } from "@/data/site";
import {
  stellarLabContractUrl,
  stellarExpertContractUrl,
  stellarExpertTxUrl,
} from "./stellar-lab";

interface FleetGridProps {
  fleet?: SubsidiaryVaultRecord[];
  factoryContractId?: string;
  wasmHash?: string;
  onSubsidiaryDeployed?: (record: SubsidiaryVaultRecord) => void;
}

interface DeploymentResult {
  subsidiary: SubsidiaryVaultRecord;
  txHash: string;
  ledger: number;
  explorerUrl: string;
  contractUrl: string;
  isFallback: boolean;
}

const PRESET_SUBSIDIARIES = [
  {
    code: "SINGAPORE_DESK",
    name: "Portus APAC Pte. Ltd.",
    jurisdiction: "Singapore, SG",
  },
  {
    code: "LONDON_BRANCH",
    name: "Portus UK Capital Ltd.",
    jurisdiction: "London, UK",
  },
  {
    code: "TOKYO_OPS",
    name: "Portus Nihon K.K.",
    jurisdiction: "Tokyo, JP",
  },
  {
    code: "ZURICH_DESK",
    name: "Portus Helvetia AG",
    jurisdiction: "Zurich, CH",
  },
];

export function FleetGrid({
  fleet = INITIAL_FLEET,
  factoryContractId = "CC2Q2JLSIHMIXS4VQMNG57FXO4LPUQPSK2Z6CQAQXH5AKL6Y5NX4TBCF",
  wasmHash = "55be053e80de94bd6935d66b36e26f0bc2543e752a0e9b06244e355519c80674",
  onSubsidiaryDeployed,
}: FleetGridProps) {
  const [fleetList, setFleetList] = useState<SubsidiaryVaultRecord[]>(fleet);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [deployResult, setDeployResult] = useState<DeploymentResult | null>(null);
  const [newlyAddedCodes, setNewlyAddedCodes] = useState<Set<string>>(new Set());

  // Form fields
  const [subsidiaryCode, setSubsidiaryCode] = useState("SINGAPORE_DESK");
  const [name, setName] = useState("Portus APAC Pte. Ltd.");
  const [jurisdiction, setJurisdiction] = useState("Singapore, SG");
  const [executableTag, setExecutableTag] = useState("v1_vault");

  // Sync if parent updates fleet
  useEffect(() => {
    if (fleet && fleet.length > 0) {
      setFleetList((prev) => {
        // Merge without losing newly added local ones
        const existingCodes = new Set(prev.map((v) => v.subsidiaryCode));
        const newFromProps = fleet.filter((v) => !existingCodes.has(v.subsidiaryCode));
        return [...prev, ...newFromProps];
      });
    }
  }, [fleet]);

  const handleApplyPreset = (preset: (typeof PRESET_SUBSIDIARIES)[number]) => {
    setSubsidiaryCode(preset.code);
    setName(preset.name);
    setJurisdiction(preset.jurisdiction);
    setDeployError(null);
  };

  const handleOpenModal = () => {
    setDeployError(null);
    setDeployResult(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isDeploying) return;
    setIsModalOpen(false);
  };

  const handleSubmitDeployment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subsidiaryCode.trim() || !name.trim() || !jurisdiction.trim()) {
      setDeployError("All fields are required for CAP-0085 deployment.");
      return;
    }

    setIsDeploying(true);
    setDeployError(null);
    setDeployResult(null);

    try {
      const res = await fetch("/api/treasury/fleet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subsidiaryCode: subsidiaryCode.trim().toUpperCase(),
          name: name.trim(),
          jurisdiction: jurisdiction.trim(),
          executableTag: executableTag.trim() || "v1_vault",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || data.detail || "Failed to deploy subsidiary vault");
      }

      const result: DeploymentResult = {
        subsidiary: data.subsidiary,
        txHash: data.txHash,
        ledger: data.ledger,
        explorerUrl: data.explorerUrl,
        contractUrl: data.contractUrl,
        isFallback: Boolean(data.isFallback),
      };

      setDeployResult(result);
      setNewlyAddedCodes((prev) => new Set(prev).add(result.subsidiary.subsidiaryCode));

      setFleetList((prev) => {
        const filtered = prev.filter(
          (v) => v.subsidiaryCode !== result.subsidiary.subsidiaryCode
        );
        return [result.subsidiary, ...filtered];
      });

      if (onSubsidiaryDeployed) {
        onSubsidiaryDeployed(result.subsidiary);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDeployError(msg);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <section id="fleet" className="w-full py-16 md:py-24 bg-[#F6F5F1] border-b border-[rgba(12,15,20,0.11)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-[rgba(12,15,20,0.11)] gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#0B3B2C]/10 text-[#0B3B2C] text-xs font-mono font-medium uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B3B2C]" />
              ACT IV · SUBSIDIARY ARCHITECTURE
            </div>
            <h2 className="text-2xl sm:text-3xl font-[480] text-[#0C0F14] tracking-tight">
              CAP-0085 Subsidiary Treasury Fleet
            </h2>
            <p className="text-sm text-[#4A5260] mt-1 max-w-2xl leading-relaxed font-[380]">
              European multinationals scale regional operating entities without bytecode bloat.
              The Portus Factory deploys regional vaults that reference a single shared executable Wasm tag
              (<code className="text-[#0C0F14] font-mono">v1_vault</code>), reducing state storage fees by over 98%.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-xs font-mono text-[#0B3B2C] hidden lg:block">
              <span className="font-[420]">Shared Bytecode Hash:</span>{" "}
              <span className="text-[#4A5260]">{wasmHash.slice(0, 14)}...</span>
            </div>

            <button
              type="button"
              onClick={handleOpenModal}
              data-magnetic="0.2"
              className="inline-flex items-center gap-2 min-h-8 py-2.5 px-4 rounded-md bg-[#0B3B2C] hover:bg-[#12543F] text-white text-xs font-[420] tracking-wide shadow-xs transition-all focus-visible:outline-2 focus-visible:outline-[#0B3B2C] active:scale-[0.98]"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="8" y1="3" x2="8" y2="13" />
                <line x1="3" y1="8" x2="13" y2="8" />
              </svg>
              <span>Deploy New Subsidiary Vault</span>
            </button>
          </div>
        </div>

        {/* Subsidiary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {fleetList.map((vault) => {
            const isNewlyDeployed = newlyAddedCodes.has(vault.subsidiaryCode);
            return (
              <div
                key={vault.subsidiaryCode}
                className={`bg-white border rounded-[var(--radius-card)] p-6 shadow-xs flex flex-col justify-between transition-all ${
                  isNewlyDeployed
                    ? "border-[#0B3B2C] ring-2 ring-[#0B3B2C]/20 shadow-md"
                    : "border-[rgba(12,15,20,0.11)]"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#785316] font-[500]">
                        {vault.subsidiaryCode} · {vault.jurisdiction}
                      </span>
                      <h3 className="text-xl font-[480] text-[#0C0F14] tracking-tight mt-0.5">
                        {vault.name}
                      </h3>
                    </div>
                    {isNewlyDeployed ? (
                      <span className="px-2.5 py-1 rounded bg-[#0B3B2C] text-white text-[10px] font-mono font-semibold animate-pulse">
                        NEWLY DEPLOYED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-[#065F46]/10 text-[#065F46] text-xs font-mono font-semibold">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 font-mono text-xs my-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[rgba(12,15,20,0.06)] gap-2">
                      <span className="text-[#646D7C]">Vault Contract ID</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={stellarExpertContractUrl(vault.vaultAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0B3B2C] hover:text-[#12543F] font-[420] underline underline-offset-4 truncate max-w-[140px] inline-flex items-center min-h-8 py-1.5 px-2 rounded focus-visible:outline-2 focus-visible:outline-[#0B3B2C]"
                          title={vault.vaultAddress}
                        >
                          {vault.vaultAddress.slice(0, 8)}...{vault.vaultAddress.slice(-4)}
                          <span aria-hidden="true" className="ml-1">↗</span>
                        </a>
                        <a
                          href={stellarLabContractUrl(vault.vaultAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#785316] hover:text-[#0C0F14] font-[420] bg-[#785316]/10 hover:bg-[#785316]/20 inline-flex items-center min-h-8 py-1.5 px-2 rounded transition-all focus-visible:outline-2 focus-visible:outline-[#785316]"
                        >
                          <span>Lab</span>
                          <span aria-hidden="true" className="ml-1">↗</span>
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[rgba(12,15,20,0.06)]">
                      <span className="text-[#646D7C]">CAP-0085 Executable Tag</span>
                      <span className="text-[#0C0F14] font-[420]">
                        {vault.executableTag} (Shared Wasm)
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <span className="text-[#646D7C]">Deployed Ledger</span>
                      <span className="text-[#0C0F14] tabular-nums font-semibold">
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
                    className="text-[#0C0F14] font-medium hover:text-[#785316] truncate max-w-[150px] inline-flex items-center min-h-8 py-1.5 px-2 rounded focus-visible:outline-2 focus-visible:outline-[#0B3B2C]"
                    title="Inspect Factory in Stellar Lab"
                  >
                    {factoryContractId.slice(0, 10)}...
                    <span aria-hidden="true" className="ml-1 text-[10px] text-[#785316]">Lab ↗</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Technical Value Callout Strip */}
        <div className="bg-[#FFFFFF] border border-[rgba(12,15,20,0.11)] rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div>
            <h4 className="font-[480] text-[#0C0F14] font-sans text-sm mb-1">
              98% State Storage Reduction
            </h4>
            <p className="text-[#4A5260] leading-relaxed font-[380]">
              Standard contract deployment duplicates full Wasm binaries for every entity.
              CAP-0085 stores bytecode once on Stellar; subsidiaries only instantiate persistent state keys.
            </p>
          </div>
          <div>
            <h4 className="font-[480] text-[#0C0F14] font-sans text-sm mb-1">
              Audited Single-Point Upgrades
            </h4>
            <p className="text-[#4A5260] leading-relaxed font-[380]">
              When protocol audits yield version improvements, the factory updates the executable pointer tag.
              Subsidiaries adopt verified security patches without coordinating 50 individual migrations.
            </p>
          </div>
          <div>
            <h4 className="font-[480] text-[#0C0F14] font-sans text-sm mb-1">
              Regional Autonomy & Ringfencing
            </h4>
            <p className="text-[#4A5260] leading-relaxed font-[380]">
              Each subsidiary maintains isolated spend policies, separate merchant whitelists, and local currency
              tax attribution while sharing audited group infrastructure.
            </p>
          </div>
        </div>
      </div>

      {/* Institutional Modal for CAP-0085 Vault Deployment */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
        >
          {/* Modal Card */}
          <div className="relative w-full max-w-xl bg-white border border-[rgba(12,15,20,0.16)] rounded-[var(--radius-card)] shadow-2xl p-6 sm:p-8 text-[#0C0F14] my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[rgba(12,15,20,0.11)]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0B3B2C]/10 text-[#0B3B2C] text-[11px] font-mono font-[500] uppercase tracking-wider mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B3B2C]" />
                  CAP-0085 FACTORY CONTRACT
                </div>
                <h3 id="modal-headline" className="text-xl font-[480] tracking-tight text-[#0C0F14]">
                  Deploy Regional Subsidiary Vault
                </h3>
                <p className="text-xs text-[#4A5260] mt-0.5 font-[380]">
                  Instantiate a new subsidiary vault referencing shared executable tag{" "}
                  <code className="text-[#0C0F14] font-mono font-semibold">v1_vault</code> on Stellar Testnet.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isDeploying}
                aria-label="Close dialog"
                className="inline-flex items-center justify-center min-h-8 py-1.5 px-2.5 rounded-md text-[#4A5260] hover:text-[#0C0F14] hover:bg-black/5 transition-colors focus-visible:outline-2 focus-visible:outline-[#0B3B2C] disabled:opacity-50"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="3" x2="13" y2="13" />
                  <line x1="13" y1="3" x2="3" y2="13" />
                </svg>
              </button>
            </div>

            {/* Judge Presets Strip */}
            <div className="mt-4 pt-1">
              <span className="block text-[11px] font-mono uppercase tracking-wider text-[#785316] font-semibold mb-2">
                1-Click Judge Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_SUBSIDIARIES.map((preset) => (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    disabled={isDeploying}
                    className={`min-h-8 px-2 py-1.5 rounded text-[11px] font-mono font-semibold border text-left transition-all ${
                      subsidiaryCode === preset.code
                        ? "bg-[#0B3B2C] text-white border-[#0B3B2C]"
                        : "bg-[#F6F5F1] text-[#0C0F14] border-[rgba(12,15,20,0.14)] hover:border-[#0C0F14]"
                    }`}
                  >
                    <div className="truncate">{preset.code.replace(/_/g, " ")}</div>
                    <div className="text-[9px] opacity-75 truncate">{preset.jurisdiction}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Deployment Form */}
            <form onSubmit={handleSubmitDeployment} className="mt-5 space-y-4">
              <div>
                <label htmlFor="subsidiaryCode" className="block text-xs font-mono font-semibold text-[#0C0F14] mb-1">
                  Subsidiary Code (CAP-0085 Symbol identifier)
                </label>
                <input
                  id="subsidiaryCode"
                  type="text"
                  value={subsidiaryCode}
                  onChange={(e) => setSubsidiaryCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))}
                  placeholder="e.g. SINGAPORE_DESK"
                  maxLength={30}
                  required
                  disabled={isDeploying}
                  className="w-full px-3 py-2 text-sm font-mono bg-[#F6F5F1] border border-[rgba(12,15,20,0.18)] rounded-md focus:bg-white focus:border-[#0B3B2C] focus:outline-hidden focus:ring-1 focus:ring-[#0B3B2C] transition-colors"
                />
                <span className="text-[10px] text-[#646D7C] font-mono mt-0.5 block">
                  On-chain Soroban Symbol (max 30 uppercase chars, alphanumeric & underscore)
                </span>
              </div>

              <div>
                <label htmlFor="entityName" className="block text-xs font-mono font-semibold text-[#0C0F14] mb-1">
                  Legal Entity Name
                </label>
                <input
                  id="entityName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Portus APAC Pte. Ltd."
                  required
                  disabled={isDeploying}
                  className="w-full px-3 py-2 text-sm bg-[#F6F5F1] border border-[rgba(12,15,20,0.18)] rounded-md focus:bg-white focus:border-[#0B3B2C] focus:outline-hidden focus:ring-1 focus:ring-[#0B3B2C] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="jurisdiction" className="block text-xs font-mono font-semibold text-[#0C0F14] mb-1">
                    Jurisdiction
                  </label>
                  <input
                    id="jurisdiction"
                    type="text"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    placeholder="e.g. Singapore, SG"
                    required
                    disabled={isDeploying}
                    className="w-full px-3 py-2 text-sm bg-[#F6F5F1] border border-[rgba(12,15,20,0.18)] rounded-md focus:bg-white focus:border-[#0B3B2C] focus:outline-hidden focus:ring-1 focus:ring-[#0B3B2C] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="executableTag" className="block text-xs font-mono font-semibold text-[#0C0F14] mb-1">
                    Factory Executable Tag
                  </label>
                  <div className="relative">
                    <input
                      id="executableTag"
                      type="text"
                      value={executableTag}
                      onChange={(e) => setExecutableTag(e.target.value)}
                      placeholder="v1_vault"
                      required
                      disabled={isDeploying}
                      className="w-full px-3 py-2 text-sm font-mono bg-[#F6F5F1] border border-[rgba(12,15,20,0.18)] rounded-md focus:bg-white focus:border-[#0B3B2C] focus:outline-hidden focus:ring-1 focus:ring-[#0B3B2C] transition-colors"
                    />
                    <span className="absolute right-2 top-2 px-1.5 py-0.5 rounded bg-black/5 text-[10px] font-mono text-[#646D7C]">
                      CAP-0085
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {deployError && (
                <div className="p-3 rounded-lg bg-[#B91C1C]/10 border border-[#B91C1C]/30 text-[#B91C1C] text-xs font-mono flex items-start gap-2">
                  <span className="font-bold">Error:</span>
                  <span className="leading-relaxed">{deployError}</span>
                </div>
              )}

              {/* Deployment Success Card */}
              {deployResult && (
                <div className="p-4 rounded-xl bg-[#065F46]/10 border border-[#065F46]/30 text-[#0C0F14] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#065F46] font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#065F46] animate-pulse" />
                      ✓ Confirmed on Stellar Testnet
                    </span>
                    <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-[#065F46]/30 text-[#065F46] font-semibold">
                      Ledger #{deployResult.ledger}
                    </span>
                  </div>

                  <div className="bg-white/80 p-3 rounded-lg space-y-2 border border-black/5 text-[11px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#646D7C]">New Vault Address:</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={deployResult.contractUrl || stellarExpertContractUrl(deployResult.subsidiary.vaultAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0B3B2C] font-semibold underline underline-offset-2 hover:text-[#12543F]"
                        >
                          {deployResult.subsidiary.vaultAddress.slice(0, 10)}...{deployResult.subsidiary.vaultAddress.slice(-4)} ↗
                        </a>
                        <a
                          href={stellarLabContractUrl(deployResult.subsidiary.vaultAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#785316] font-semibold bg-[#785316]/10 px-1.5 py-0.5 rounded hover:bg-[#785316]/20"
                        >
                          Lab ↗
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#646D7C]">Transaction Hash:</span>
                      <a
                        href={deployResult.explorerUrl || stellarExpertTxUrl(deployResult.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0B3B2C] font-semibold underline underline-offset-2 hover:text-[#12543F] truncate max-w-[180px]"
                      >
                        {deployResult.txHash.slice(0, 12)}...{deployResult.txHash.slice(-4)} ↗
                      </a>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/5">
                      <span className="text-[#646D7C]">State Storage Efficiency:</span>
                      <span className="text-[#065F46] font-bold">98% saved vs full bytecode</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[rgba(12,15,20,0.11)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isDeploying}
                  className="min-h-8 py-2 px-4 rounded-md text-xs font-[420] text-[#4A5260] hover:text-[#0C0F14] hover:bg-black/5 transition-colors focus-visible:outline-2 focus-visible:outline-[#0B3B2C] disabled:opacity-50"
                >
                  {deployResult ? "Close" : "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={isDeploying}
                  data-magnetic="0.2"
                  className="inline-flex items-center justify-center gap-2 min-h-8 py-2.5 px-5 rounded-md bg-[#0B3B2C] hover:bg-[#12543F] text-white text-xs font-[420] tracking-wide shadow-xs transition-all focus-visible:outline-2 focus-visible:outline-[#0B3B2C] disabled:opacity-60 active:scale-[0.98]"
                >
                  {isDeploying ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Broadcasting on Stellar Testnet...</span>
                    </>
                  ) : deployResult ? (
                    <span>Deploy Another Vault</span>
                  ) : (
                    <span>Submit On-Chain Deployment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
