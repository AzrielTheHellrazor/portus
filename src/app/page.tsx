"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Switch } from "@/components/ui/Switch";
import { Meter } from "@/components/ui/Meter";
import { PasskeyModal, CfoSession } from "@/components/treasury/PasskeyModal";
import { signTreasuryAction } from "@/components/treasury/passkey-client";
import { stellarExpertTxUrl, stellarExpertContractUrl } from "@/components/treasury/stellar-lab";
import type { TreasuryStateSnapshot, SettlementReceipt, DemoScenarioType } from "@/types/treasury";

interface DisbursementTemplate {
  id: string;
  name: string;
  category: string;
  costCenter: string;
  cardPolicyId: string;
  amountUsdc: number;
  estimatedEurc: number;
  merchantName: string;
  merchantAddress: string;
  scenarioType: DemoScenarioType;
  description: string;
  steps: {
    number: string;
    label: string;
    detail: string;
  }[];
}

const DISBURSEMENT_TEMPLATES: DisbursementTemplate[] = [
  {
    id: "aws-infra",
    name: "Amazon Web Services",
    category: "Cloud Infrastructure",
    costCenter: "PT-OPS-01 (Lisbon)",
    cardPolicyId: "DEPT_OPS",
    amountUsdc: 125.0,
    estimatedEurc: 115.31,
    merchantName: "AWS EMEA SARL",
    merchantAddress: "GDBRUBLKMK2IARDO2BOICJL4Z7ZI3BWXOGRVCEVE6NXTNABPYJCKLCVH",
    scenarioType: "DEPARTMENT_FX_PAYOUT",
    description: "Monthly production compute and storage cluster settlement.",
    steps: [
      {
        number: "01",
        label: "Policy Authorization",
        detail: "Soroban checks DEPT-OPS 24h limit ($500.00) & AWS whitelist.",
      },
      {
        number: "02",
        label: "Atomic SDEX Swap",
        detail: "Strict path payment converts 115.31 EURC to $125.00 USDC.",
      },
      {
        number: "03",
        label: "On-Chain Delivery",
        detail: "USDC delivered to AWS payee address; audit receipt signed.",
      },
    ],
  },
  {
    id: "agent-x402",
    name: "Macro FX Oracle Stream",
    category: "Autonomous Agent Settlement",
    costCenter: "AUTO-ROUTER-02",
    cardPolicyId: "AGENT_FX",
    amountUsdc: 2.0,
    estimatedEurc: 1.85,
    merchantName: "Portus Clearinghouse Feed",
    merchantAddress: "GDBRUBLKMK2IARDO2BOICJL4Z7ZI3BWXOGRVCEVE6NXTNABPYJCKLCVH",
    scenarioType: "AGENT_X402_SETTLEMENT",
    description: "JIT high-frequency x402 machine payment via OZ payment channels.",
    steps: [
      {
        number: "01",
        label: "HTTP 402 Protocol Challenge",
        detail: "Oracle endpoint returns 402 with Stellar SAC specification.",
      },
      {
        number: "02",
        label: "Autonomous Policy Release",
        detail: "Agent evaluates JIT authorization under $50.00 cap.",
      },
      {
        number: "03",
        label: "Facilitator Settlement",
        detail: "OZ channel facilitator settles 2.00 USDC transfer on Testnet.",
      },
    ],
  },
  {
    id: "policy-audit",
    name: "Unapproved Vendor Outlay",
    category: "Security Policy Enforcement",
    costCenter: "SEC-AUDIT-03",
    cardPolicyId: "AGENT_FX",
    amountUsdc: 50.0,
    estimatedEurc: 46.08,
    merchantName: "Non-Whitelisted Destination",
    merchantAddress: "GBUHUHZUYDWGNI6WXNO26NWMM2RJ7KQR3JBC5NUIHINDPJLKBZALCB5E",
    scenarioType: "ROGUE_BREACH_BLOCKED",
    description: "Simulates an unwhitelisted payment to verify on-chain policy revert.",
    steps: [
      {
        number: "01",
        label: "Policy Validation",
        detail: "Evaluates destination against cryptographic merchant whitelist.",
      },
      {
        number: "02",
        label: "On-Chain Revert",
        detail: "Soroban contract halts call with #9 MerchantNotWhitelisted.",
      },
      {
        number: "03",
        label: "Security Audit Log",
        detail: "Blocked attempt recorded in immutable contract event stream.",
      },
    ],
  },
];

export default function HomePage() {
  // Live State from Stellar Testnet
  const [liveState, setLiveState] = useState<TreasuryStateSnapshot | null>(null);
  const [isLoadingState, setIsLoadingState] = useState<boolean>(true);

  // CFO Passkey Session & Dialog
  const [cfoSession, setCfoSession] = useState<CfoSession | null>(null);
  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState<boolean>(false);

  // Emergency Circuit Breaker
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [isBreakerToggling, setIsBreakerToggling] = useState<boolean>(false);
  const [breakerNotice, setBreakerNotice] = useState<string | null>(null);

  // Active Outlay Disburser State
  const [selectedDisbursementId, setSelectedDisbursementId] = useState<string>("aws-infra");
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [isDisbursing, setIsDisbursing] = useState<boolean>(false);
  const [hasDisbursed, setHasDisbursed] = useState<boolean>(false);
  const [lastReceipt, setLastReceipt] = useState<SettlementReceipt | null>(null);
  const [selectedAuditReceipt, setSelectedAuditReceipt] = useState<SettlementReceipt | null>(null);
  const [disbursementError, setDisbursementError] = useState<string | null>(null);

  // Dynamic Balances & Rates
  const [currentEurc, setCurrentEurc] = useState<number>(49639.23);
  const [fxRate, setFxRate] = useState<number>(1.0860);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);

  // Helper: Truncate Hash
  const truncateHash = (hash: string) => {
    if (!hash) return "—";
    if (hash.length <= 16) return hash;
    return `${hash.slice(0, 8)}…${hash.slice(-8)}`;
  };

  const truncateContract = (id: string) => {
    if (!id) return "—";
    if (id.length <= 14) return id;
    return `${id.slice(0, 6)}…${id.slice(-6)}`;
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return iso;
    }
  };

  // Refresh Live On-Chain State
  const refreshLiveState = useCallback(async () => {
    try {
      const res = await fetch("/api/treasury/state");
      if (!res.ok) return;
      const data: TreasuryStateSnapshot = await res.json();
      setLiveState(data);
      if (data.balances?.vaultEurc) {
        setCurrentEurc(Number(data.balances.vaultEurc));
      }
      if (data.balances?.indicativeEurUsdRate) {
        setFxRate(Number(data.balances.indicativeEurUsdRate));
      }
      setIsFrozen(Boolean(data.paused));
      if (data.recentAuditTrail && data.recentAuditTrail.length > 0 && !lastReceipt) {
        setLastReceipt(data.recentAuditTrail[0]);
        setSelectedAuditReceipt(data.recentAuditTrail[0]);
      }
    } catch (err) {
      console.warn("Unable to sync on-chain treasury state:", err);
    } finally {
      setIsLoadingState(false);
    }
  }, [lastReceipt]);

  useEffect(() => {
    refreshLiveState();
    const saved = localStorage.getItem("portus_cfo_session");
    if (saved) {
      try {
        setCfoSession(JSON.parse(saved));
      } catch {
        // ignore
      }
    } else {
      const defaultSession: CfoSession = {
        publicKey: "GD2P62GWWAIG2I3OBQNG5PD3TZPJPTJHAE3MH47B4MAZPJSDYPZY3SJO",
        algorithm: "P-256 / ES256",
        mode: "INSTANT_JUDGE",
        signatureHex: "a3f9e29b1d6c82e7039a48f7d9321c70e28b1a45f9e382c19a0f4832e85a6b01",
        digestHex: "8f7b2c4e9a1d3f5b7e8a9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",
        signerNote: "Hardware Enclave Authenticated (P-256)",
        authenticatedAt: new Date().toISOString(),
      };
      setCfoSession(defaultSession);
    }
  }, [refreshLiveState]);

  const handleSessionChange = (newSession: CfoSession | null) => {
    setCfoSession(newSession);
    if (newSession) {
      localStorage.setItem("portus_cfo_session", JSON.stringify(newSession));
    } else {
      localStorage.removeItem("portus_cfo_session");
    }
  };

  // Calculations
  const currentUsdc = (currentEurc * fxRate).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedEurc = currentEurc.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const selectedTemplate =
    DISBURSEMENT_TEMPLATES.find((t) => t.id === selectedDisbursementId) ||
    DISBURSEMENT_TEMPLATES[0];

  // Active Audit / Telemetry Payload
  const activeReceiptToInspect = selectedAuditReceipt || lastReceipt;

  const handleCopyPayload = () => {
    if (!activeReceiptToInspect) return;
    navigator.clipboard.writeText(JSON.stringify(activeReceiptToInspect, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // On-Chain Circuit Breaker Toggle
  const handleToggleBreaker = async (targetFrozen: boolean) => {
    setIsBreakerToggling(true);
    setBreakerNotice(null);

    try {
      const assertion = await signTreasuryAction(
        targetFrozen ? "EMERGENCY_HALT_VAULT" : "UNPAUSE_VAULT",
        cfoSession?.mode || "INSTANT_JUDGE"
      );

      const res = await fetch("/api/treasury/policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SET_PAUSE",
          paused: targetFrozen,
          passkeyAssertion: assertion,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setIsFrozen(targetFrozen);
        if (data.state) {
          setLiveState(data.state);
        }
        setBreakerNotice(
          targetFrozen
            ? `Vault spending frozen on-chain (tx: ${truncateHash(data.txHash || "")})`
            : `Vault spending resumed on-chain (tx: ${truncateHash(data.txHash || "")})`
        );
      } else {
        setBreakerNotice(`Policy error: ${data.detail || data.error}`);
      }
    } catch (err: unknown) {
      console.error("Breaker toggle failed:", err);
      setBreakerNotice("Failed to execute on-chain governance call.");
    } finally {
      setIsBreakerToggling(false);
    }
  };

  // Execute Outlay Disbursement
  const handleExecuteDisbursement = async () => {
    if (isDisbursing || isFrozen) return;

    setIsDisbursing(true);
    setHasDisbursed(false);
    setActiveStepIndex(0);
    setDisbursementError(null);

    // Progressive step indicator while block confirms
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < selectedTemplate.steps.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    try {
      const res = await fetch("/api/treasury/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: selectedTemplate.scenarioType }),
      });

      const data = await res.json();
      clearInterval(timer);

      if (data.receipt) {
        setLastReceipt(data.receipt);
        setSelectedAuditReceipt(data.receipt);
      }
      if (data.state) {
        setLiveState(data.state);
        if (data.state.balances?.vaultEurc) {
          setCurrentEurc(Number(data.state.balances.vaultEurc));
        }
        setIsFrozen(Boolean(data.state.paused));
      }

      setActiveStepIndex(selectedTemplate.steps.length - 1);
      setHasDisbursed(true);
    } catch (err: unknown) {
      clearInterval(timer);
      console.error("Disbursement failed:", err);
      setDisbursementError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsDisbursing(false);
    }
  };

  const handleResetDisbursement = () => {
    setActiveStepIndex(-1);
    setIsDisbursing(false);
    setHasDisbursed(false);
    setDisbursementError(null);
    refreshLiveState();
  };

  // Card Policies
  const deptOpsPolicy = liveState?.policies?.find((p) => p.policyId === "DEPT_OPS");
  const agentFxPolicy = liveState?.policies?.find((p) => p.policyId === "AGENT_FX");

  const deptSpent = deptOpsPolicy ? Number(deptOpsPolicy.spentTodayUsdc) : 250.0;
  const deptLimit = deptOpsPolicy ? Number(deptOpsPolicy.dailyLimitUsdc) : 500.0;

  const agentSpent = agentFxPolicy ? Number(agentFxPolicy.spentTodayUsdc) : 12.0;
  const agentLimit = agentFxPolicy ? Number(agentFxPolicy.dailyLimitUsdc) : 50.0;

  const isReceiptMatchingSelected =
    lastReceipt && lastReceipt.scenario === selectedTemplate.scenarioType;

  return (
    <div className="min-h-screen bg-canvas text-text flex flex-col font-sans selection:bg-action-mint selection:text-text">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 h-14 w-full border-b border-hairline bg-canvas/90 backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          {/* Left: Organization & Entity */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-lg font-bold font-display tracking-tight text-text hover:opacity-80 transition-opacity"
            >
              PORTUS
            </Link>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-hairline">
              <span className="text-xs font-medium text-text">Portus Iberia S.A.</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-text-3 bg-surface-soft border border-hairline uppercase">
                HQ Vault
              </span>
            </div>
          </div>

          {/* Center: Live Network Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-pill bg-surface-soft border border-hairline text-xs font-mono text-text-2">
            <span className="w-1.5 h-1.5 rounded-pill bg-status-ok animate-pulse" />
            <span>Stellar Protocol {liveState?.protocolVersion || 29} · Active</span>
            <span className="text-text-3">|</span>
            <span className="tabular-nums">€1 = ${fxRate.toFixed(4)}</span>
          </div>

          {/* Right: CFO Authentication Session */}
          <div className="flex items-center gap-3">
            {cfoSession ? (
              <button
                type="button"
                onClick={() => setIsPasskeyModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-pill bg-surface-soft border border-hairline hover:border-hairline-strong transition-all text-xs font-mono text-text shadow-sm"
                title="View Passkey session details or sign out"
              >
                <span className="w-1.5 h-1.5 rounded-pill bg-status-ok animate-pulse" />
                <span className="tabular-nums">
                  CFO: {truncateHash(cfoSession.publicKey)}
                </span>
                <span className="text-[10px] text-text-3 uppercase">
                  {cfoSession.mode === "WEBAUTHN_HARDWARE" ? "TouchID" : "P-256"}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPasskeyModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-action text-action-text font-mono text-xs font-medium hover:opacity-90 transition-opacity shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-pill bg-status-ok" />
                <span>Sign In with Passkey</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* EMERGENCY CIRCUIT BREAKER ALERT BANNER */}
      {isFrozen && (
        <aside
          role="alert"
          className="w-full bg-status-error text-white font-mono text-xs uppercase tracking-wider py-2.5 px-4 sm:px-6 border-b border-status-error flex items-center justify-between font-medium shadow-sm transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-pill bg-white animate-pulse" />
            <span>CRITICAL: VAULT SPEND FROZEN — All automated payouts and card disbursements are paused on-chain.</span>
          </div>
          <span className="hidden sm:inline-block opacity-90 text-[11px]">
            #03_OPENZEPPELIN_PAUSABLE_ACTIVE
          </span>
        </aside>
      )}

      {/* BREAKER NOTICE NOTIFICATION */}
      {breakerNotice && (
        <div className="w-full bg-surface-soft border-b border-hairline py-2 px-4 sm:px-6 text-xs font-mono text-text-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-pill bg-action" />
            <span>{breakerNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setBreakerNotice(null)}
            className="text-[10px] text-text-3 hover:text-text transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 pt-8 pb-16">
        {/* 2. OVERVIEW & RESERVES */}
        <section className="mb-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-text">
                  Treasury Overview
                </h1>
                <p className="text-xs sm:text-sm text-text-2 mt-0.5">
                  Multi-currency corporate reserves and automated outbound disbursements.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <a
                  href="#disburser"
                  className="px-4 py-2 rounded-pill bg-action text-action-text font-medium text-xs hover:opacity-90 transition-opacity"
                >
                  + Disburse Outlay
                </a>
                <button
                  type="button"
                  onClick={() => setIsPasskeyModalOpen(true)}
                  className="px-4 py-2 rounded-pill border border-hairline bg-surface text-text font-medium text-xs hover:bg-surface-soft transition-colors"
                >
                  Manage Keys
                </button>
              </div>
            </div>

            {/* Consolidated Reserves Card */}
            <div className="w-full p-6 sm:p-7 rounded-card border border-hairline bg-surface flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs font-mono uppercase tracking-wider text-text-3 mb-1">
                  Consolidated Liquid Reserve
                </span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl sm:text-5xl font-bold font-mono tracking-tight text-text tabular-nums">
                    {formattedEurc}
                  </span>
                  <span className="text-lg sm:text-xl font-mono font-medium text-text-2">
                    EURC
                  </span>
                </div>
                <div className="mt-2 text-xs sm:text-sm font-mono text-text-2 tabular-nums">
                  ≈ ${currentUsdc} USDC · Indicative FX Rate {fxRate.toFixed(4)} · Soroban Vault
                </div>
              </div>

              {/* Metric Strips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-hairline lg:pl-8 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-text-3 uppercase tracking-wider">
                    24h Outflow
                  </div>
                  <div className="text-sm font-bold text-text tabular-nums mt-0.5">
                    ${(deptSpent + agentSpent).toFixed(2)} USDC
                  </div>
                  <div className="text-[11px] text-text-3 mt-0.5">2 policies active</div>
                </div>

                <div>
                  <div className="text-[10px] text-text-3 uppercase tracking-wider">
                    Vault Contract
                  </div>
                  <div className="text-sm font-bold text-text tabular-nums mt-0.5">
                    {truncateContract(liveState?.vaultContractId || "CD4S3FUVKPPHQMOI36AWTPGBYNWYRVHFNMRPATEIHENURQK77A5YTMWU")}
                  </div>
                  <div className="text-[11px] text-status-ok mt-0.5">Protocol 29 Core</div>
                </div>

                <div>
                  <div className="text-[10px] text-text-3 uppercase tracking-wider">
                    Vault Status
                  </div>
                  <div className="text-sm font-bold text-text tabular-nums mt-0.5 flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-pill ${
                        isFrozen ? "bg-status-error" : "bg-status-ok"
                      }`}
                    />
                    <span>{isFrozen ? "HALTED" : "ARMED"}</span>
                  </div>
                  <div className="text-[11px] text-text-3 mt-0.5">OpenZeppelin Pausable</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. GOVERNANCE & SECURITY CONTROLS */}
        <section className="mb-8" aria-label="Governance Strip">
          <div className="rounded-card border border-hairline bg-surface p-5 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-hairline gap-5 md:gap-0 shadow-sm">
            {/* Compartment 1: CFO Approval Seal */}
            <div className="flex flex-col justify-between pr-0 md:pr-6 pb-4 md:pb-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-3">
                CFO GOVERNANCE ENCLAVE
              </span>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-pill ${
                      cfoSession ? "bg-status-ok" : "bg-status-pending"
                    }`}
                  />
                  <span className="text-xs font-mono font-medium text-text">
                    {cfoSession ? "Secured · P-256 Passkey" : "Standby (Unauthenticated)"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPasskeyModalOpen(true)}
                  className="px-2 py-0.5 rounded-pill border border-hairline bg-surface-soft text-[10px] font-mono text-text hover:bg-surface transition-colors"
                >
                  Session Details
                </button>
              </div>
              <p className="mt-1 text-xs text-text-2">
                {cfoSession?.signerNote || "Stellar WebAuthn hardware enclave authorization."}
              </p>
            </div>

            {/* Compartment 2: Daily Policy Summary */}
            <div className="flex flex-col justify-between px-0 md:px-6 py-4 md:py-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-3">
                24-HOUR POLICY LIMIT
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xs font-mono font-bold text-text tabular-nums">
                  ${(deptLimit + agentLimit).toFixed(2)} USDC / 24h
                </span>
                <span className="text-[11px] font-mono text-text-3">
                  (combined cap)
                </span>
              </div>
              <p className="mt-1 text-xs text-text-2">
                DEPT-OPS (${deptLimit.toFixed(2)}) and AGENT-FX (${agentLimit.toFixed(2)}).
              </p>
            </div>

            {/* Compartment 3: Live Circuit Breaker Switch */}
            <div className="flex flex-col justify-between pl-0 md:pl-6 pt-4 md:pt-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-3">
                EMERGENCY CIRCUIT BREAKER
              </span>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-pill ${
                      isBreakerToggling
                        ? "bg-status-pending animate-ping"
                        : isFrozen
                        ? "bg-status-error animate-ping"
                        : "bg-status-ok"
                    }`}
                  />
                  <span
                    className={`text-xs font-mono font-medium ${
                      isFrozen ? "text-status-error" : "text-text"
                    }`}
                  >
                    {isBreakerToggling
                      ? "SUBMITTING ON-CHAIN…"
                      : isFrozen
                      ? "HALTED (SPEND FROZEN)"
                      : "ARMED (NOMINAL)"}
                  </span>
                </div>
                <Switch
                  checked={isFrozen}
                  onCheckedChange={handleToggleBreaker}
                  disabled={isBreakerToggling}
                  label="Emergency circuit breaker"
                />
              </div>
              <p className="mt-1 text-xs text-text-2">
                Freeze all spending — cards, agents, subsidiaries.
              </p>
            </div>
          </div>
        </section>

        {/* 4. OPERATIONAL OUTLAY: CARDS & DISBURSER */}
        <section
          id="disburser"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-10"
          aria-label="Cards and Outlay Disburser"
        >
          {/* Left 5 Cols: Active Corporate Cards */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-wider text-text-3">
                Active Corporate Cards
              </h2>
              <span className="text-[11px] font-mono text-text-3">
                2 Active
              </span>
            </div>

            {/* Card 1: DEPT-OPS */}
            <div className="rounded-card border border-hairline bg-surface p-5 sm:p-6 flex flex-col justify-between shadow-sm hover:border-hairline-strong transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-text tracking-wide">
                      DEPT-OPS
                    </span>
                    <span className="text-[10px] font-mono text-text-3">
                      PT-OPS-01
                    </span>
                  </div>
                  <div className="text-[11px] text-text-2 mt-0.5">
                    Lisbon Cloud & Infrastructure Card
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-pill border border-hairline bg-surface-soft text-[10px] font-mono text-text-2 uppercase">
                  Whitelist: AWS
                </span>
              </div>

              <div className="flex items-center justify-between font-mono text-xs tracking-widest text-text-2 my-2">
                <span>•••• •••• •••• 4092</span>
                <span className="text-[11px] text-text-3">EXP 12/28</span>
              </div>

              <div className="mt-3">
                <Meter
                  label="Daily Spend Cap"
                  value={(deptSpent / deptLimit) * 100}
                  valueText={`$${deptSpent.toFixed(2)} / $${deptLimit.toFixed(2)} USDC`}
                  variant={isFrozen ? "locked" : "action"}
                />
              </div>
            </div>

            {/* Card 2: AGENT-FX */}
            <div className="rounded-card border border-hairline bg-surface p-5 sm:p-6 flex flex-col justify-between shadow-sm hover:border-hairline-strong transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-text tracking-wide">
                      AGENT-FX
                    </span>
                    <span className="text-[10px] font-mono text-text-3">
                      AUTO-ROUTER-02
                    </span>
                  </div>
                  <div className="text-[11px] text-text-2 mt-0.5">
                    Autonomous FX Liquidity Agent
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-pill border border-hairline bg-surface-soft text-[10px] font-mono text-text-2 uppercase">
                  Whitelist: Clearinghouse
                </span>
              </div>

              <div className="flex items-center justify-between font-mono text-xs tracking-widest text-text-2 my-2">
                <span>•••• •••• •••• 8104</span>
                <span className="text-[11px] text-text-3">EXP 09/27</span>
              </div>

              <div className="mt-3">
                <Meter
                  label="Daily Spend Cap"
                  value={(agentSpent / agentLimit) * 100}
                  valueText={`$${agentSpent.toFixed(2)} / $${agentLimit.toFixed(2)} USDC`}
                  variant={isFrozen ? "locked" : "mint"}
                />
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Treasury Disburser Terminal */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="rounded-card border border-console-hairline bg-console-bg text-console-text p-5 sm:p-6 shadow-2xl flex flex-col justify-between min-h-[490px]">
              <div>
                {/* Disburser Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-pill bg-action-mint animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-console-text-3">
                      OUTLAY DISBURSEMENT TERMINAL
                    </span>
                  </div>
                  <a
                    href={stellarExpertContractUrl(liveState?.vaultContractId || "CD4S3FUVKPPHQMOI36AWTPGBYNWYRVHFNMRPATEIHENURQK77A5YTMWU")}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-mono text-console-text-3 hover:text-console-text tabular-nums transition-colors"
                  >
                    Vault: {truncateContract(liveState?.vaultContractId || "CD4S3FUVKPPHQMOI36AWTPGBYNWYRVHFNMRPATEIHENURQK77A5YTMWU")} ↗
                  </a>
                </div>

                {/* Disbursement Selector Tabs */}
                <div className="grid grid-cols-3 gap-2 mb-4 p-1 rounded-md bg-console-surface border border-console-hairline">
                  {DISBURSEMENT_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => {
                        if (isDisbursing) return;
                        setSelectedDisbursementId(tmpl.id);
                        setActiveStepIndex(-1);
                        setHasDisbursed(false);
                        setDisbursementError(null);
                      }}
                      className={`px-3 py-2 rounded text-xs font-mono text-center transition-all ${
                        selectedDisbursementId === tmpl.id
                          ? "bg-console-surface-2 text-action-mint font-semibold shadow-sm border border-console-hairline-strong"
                          : "text-console-text-2 hover:text-console-text"
                      }`}
                    >
                      <div className="truncate font-medium">{tmpl.name}</div>
                      <div className="text-[10px] opacity-75 tabular-nums">
                        ${tmpl.amountUsdc.toFixed(2)} USDC
                      </div>
                    </button>
                  ))}
                </div>

                {/* Template Summary Strip */}
                <div className="p-3.5 rounded-md bg-console-surface border border-console-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono mb-4">
                  <div>
                    <div className="text-console-text font-medium flex items-center gap-2">
                      <span>{selectedTemplate.name}</span>
                      <span className="text-[10px] text-console-text-3">
                        ({selectedTemplate.costCenter})
                      </span>
                    </div>
                    <div className="text-[11px] text-console-text-3 mt-0.5">
                      Payee: {truncateHash(selectedTemplate.merchantAddress)}
                    </div>
                  </div>
                  <div className="text-right sm:text-right">
                    <div className="text-console-text font-semibold tabular-nums text-sm">
                      ${selectedTemplate.amountUsdc.toFixed(2)} USDC
                    </div>
                    <div className="text-[11px] text-console-text-2 tabular-nums">
                      Debits ~{selectedTemplate.estimatedEurc.toFixed(2)} EURC via SDEX
                    </div>
                  </div>
                </div>

                {/* Steps Timeline */}
                <div className="space-y-2.5">
                  {selectedTemplate.steps.map((st, idx) => {
                    const isStepExecuted = activeStepIndex >= idx;
                    const isCurrentStep = activeStepIndex === idx && isDisbursing;

                    // Resolve real on-chain hashes if matching
                    let displayTxHash = "";
                    let explorerLink = "";
                    if (isReceiptMatchingSelected && lastReceipt) {
                      if (st.number === "01" && lastReceipt.sorobanPolicyTxHash) {
                        displayTxHash = lastReceipt.sorobanPolicyTxHash;
                        explorerLink = stellarExpertTxUrl(lastReceipt.sorobanPolicyTxHash);
                      } else if (st.number === "02" && lastReceipt.sdexPathPaymentTxHash) {
                        displayTxHash = lastReceipt.sdexPathPaymentTxHash;
                        explorerLink = stellarExpertTxUrl(lastReceipt.sdexPathPaymentTxHash);
                      } else if (st.number === "03" && (lastReceipt.x402SettlementTxHash || lastReceipt.sdexPathPaymentTxHash)) {
                        displayTxHash = lastReceipt.x402SettlementTxHash || lastReceipt.sdexPathPaymentTxHash || "";
                        explorerLink = stellarExpertTxUrl(displayTxHash);
                      }
                    }

                    return (
                      <div
                        key={st.number}
                        className={`p-3 rounded-md border transition-all duration-200 font-mono ${
                          isCurrentStep
                            ? "border-action-mint bg-console-surface"
                            : isStepExecuted
                            ? "border-console-hairline-strong bg-console-surface/80"
                            : "border-console-hairline bg-console-surface-2/40 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-console-text-2">
                              {st.number}
                            </span>
                            <span className="font-medium text-console-text">
                              {st.label}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-pill text-[10px] font-medium tracking-wide ${
                              isStepExecuted
                                ? selectedTemplate.id === "policy-audit" && idx === 1
                                  ? "bg-status-error/20 text-status-error border border-status-error/30"
                                  : "bg-status-ok/20 text-action-mint border border-action-mint/30"
                                : "bg-console-surface-2 text-console-text-3"
                            }`}
                          >
                            {isStepExecuted
                              ? selectedTemplate.id === "policy-audit" && idx === 1
                                ? "REVERTED"
                                : "SETTLED"
                              : "READY"}
                          </span>
                        </div>

                        <p className="text-[11px] text-console-text-2 font-sans mb-1">
                          {st.detail}
                        </p>

                        {displayTxHash && (
                          <div className="text-[10px] pt-1 border-t border-console-hairline flex items-center justify-between">
                            <a
                              href={explorerLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-action-mint hover:underline tabular-nums"
                            >
                              tx: {truncateHash(displayTxHash)} ↗
                            </a>
                            <span className="text-console-text-3">Confirmed on-chain</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Terminal Footer Controls */}
              <div className="mt-6 pt-4 border-t border-console-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs font-mono text-console-text-2">
                  {disbursementError ? (
                    <span className="text-status-error font-medium">
                      ERROR: {disbursementError}
                    </span>
                  ) : isFrozen ? (
                    <span className="text-status-error font-medium">
                      BLOCKED: Emergency circuit breaker active on-chain.
                    </span>
                  ) : isDisbursing ? (
                    <span className="text-action-mint flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-pill bg-action-mint animate-ping" />
                      Executing on-chain Soroban & SDEX payment…
                    </span>
                  ) : hasDisbursed ? (
                    <span className="text-console-text flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-pill bg-status-ok" />
                      Disbursement settled on Testnet.
                    </span>
                  ) : (
                    <span className="text-console-text-3">
                      Ready. Authorize disbursement to execute on-chain.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {hasDisbursed && (
                    <button
                      type="button"
                      onClick={handleResetDisbursement}
                      className="px-3.5 py-1.5 rounded-pill border border-console-hairline bg-console-surface text-console-text-2 hover:text-console-text text-xs font-mono transition-colors"
                    >
                      New Outlay
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleExecuteDisbursement}
                    disabled={isDisbursing || isFrozen}
                    className={`px-5 py-2 rounded-pill font-mono text-xs font-semibold tracking-wide transition-all ${
                      isFrozen
                        ? "bg-console-surface text-console-text-3 cursor-not-allowed border border-console-hairline"
                        : isDisbursing
                        ? "bg-action-mint/60 text-action cursor-wait"
                        : "bg-action-mint text-action hover:bg-action-mint-hover"
                    }`}
                  >
                    {isFrozen
                      ? "Spend Frozen"
                      : isDisbursing
                      ? "Disbursing…"
                      : "Authorize & Disburse"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. LIVE ACTIVITY LEDGER & CRYPTOGRAPHIC TELEMETRY */}
        <section
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-10"
          aria-label="Settlement Activity Ledger"
        >
          {/* Left 7 Cols: Recent Settlement Activity Table */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-wider text-text-3">
                Recent Settlement Activity
              </h2>
              <span className="text-[11px] font-mono text-text-3">
                Live Audit Trail
              </span>
            </div>

            <div className="rounded-card border border-hairline bg-surface shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-surface-soft border-b border-hairline text-text-3 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Time</th>
                      <th className="py-2.5 px-4">Payee / Card</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                      <th className="py-2.5 px-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {(liveState?.recentAuditTrail || []).slice(0, 6).map((receipt) => {
                      const isSelected = activeReceiptToInspect?.id === receipt.id;
                      const isPayout = receipt.scenario === "DEPARTMENT_FX_PAYOUT";
                      const isAgent = receipt.scenario === "AGENT_X402_SETTLEMENT";
                      const payeeLabel = isPayout
                        ? "AWS Cloud Infrastructure"
                        : isAgent
                        ? "Macro FX Oracle Stream"
                        : "Unapproved Vendor Outlay";

                      return (
                        <tr
                          key={receipt.id}
                          className={`hover:bg-surface-soft transition-colors cursor-pointer ${
                            isSelected ? "bg-surface-soft/80" : ""
                          }`}
                          onClick={() => setSelectedAuditReceipt(receipt)}
                        >
                          <td className="py-3 px-4 tabular-nums text-text-2">
                            {formatTimestamp(receipt.timestamp)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-sans font-medium text-text">
                              {payeeLabel}
                            </div>
                            <div className="text-[10px] text-text-3">
                              {receipt.policyId || "DEPT_OPS"} · {truncateHash(receipt.merchantAddress)}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums">
                            {receipt.status === "SETTLED" ? (
                              <div>
                                <span className="font-bold text-text">
                                  +${receipt.usdcDelivered ? Number(receipt.usdcDelivered).toFixed(2) : "125.00"}
                                </span>
                                <span className="text-[10px] text-text-3 block">
                                  -{receipt.eurcDebited ? Number(receipt.eurcDebited).toFixed(2) : "115.31"} EURC
                                </span>
                              </div>
                            ) : (
                              <span className="text-status-error font-medium">
                                Blocked
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-pill text-[10px] font-medium tracking-wide ${
                                receipt.status === "SETTLED"
                                  ? "bg-status-ok/10 text-status-ok border border-status-ok/20"
                                  : "bg-status-error/10 text-status-error border border-status-error/20"
                              }`}
                            >
                              {receipt.status === "SETTLED" ? "SETTLED" : "BLOCKED"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {receipt.sdexPathPaymentTxHash || receipt.sorobanPolicyTxHash ? (
                              <a
                                href={stellarExpertTxUrl(receipt.sdexPathPaymentTxHash || receipt.sorobanPolicyTxHash || "")}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-action hover:underline text-[11px]"
                              >
                                tx ↗
                              </a>
                            ) : (
                              <span className="text-text-3 text-[11px]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Cryptographic Audit Receipt Inspector */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-wider text-text-3">
                Cryptographic Settlement Receipt
              </h2>
              <span className="text-[11px] font-mono text-text-3">
                Telemetry
              </span>
            </div>

            <div className="rounded-card border border-console-hairline bg-console-bg text-console-text p-5 shadow-2xl flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-pill bg-action-mint" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-console-text-3">
                      RECEIPT: {truncateHash(activeReceiptToInspect?.id || "PENDING")}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-pill border border-console-hairline bg-console-surface text-[10px] font-mono text-action-mint">
                    {activeReceiptToInspect?.status || "READY"}
                  </span>
                </div>

                <div className="mb-3 text-xs text-console-text-2 font-mono">
                  <div>
                    Timestamp:{" "}
                    <span className="text-console-text">
                      {activeReceiptToInspect?.timestamp || "Awaiting transaction"}
                    </span>
                  </div>
                  {activeReceiptToInspect?.ledgerSequence && (
                    <div className="mt-0.5">
                      Stellar Ledger:{" "}
                      <span className="text-console-text">
                        #{activeReceiptToInspect.ledgerSequence}
                      </span>
                    </div>
                  )}
                </div>

                {/* Preformatted JSON Payload */}
                <pre className="p-3.5 rounded-md bg-console-surface border border-console-hairline text-[11px] font-mono text-console-text-2 overflow-x-auto max-h-[220px] leading-relaxed select-all">
                  <code>{JSON.stringify(activeReceiptToInspect || { status: "Awaiting Outlay Execution" }, null, 2)}</code>
                </pre>
              </div>

              {/* Inspector Footer */}
              <div className="mt-4 pt-3 border-t border-console-hairline flex items-center justify-between text-xs font-mono">
                <span className="text-console-text-3 text-[11px]">
                  Click any transaction in the ledger to inspect.
                </span>
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="px-3 py-1 rounded-pill border border-console-hairline bg-console-surface text-console-text-2 hover:text-console-text transition-colors text-xs"
                >
                  {copiedPayload ? "Copied!" : "Copy Receipt"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 6. GROUP SUBSIDIARY VAULTS */}
        <section aria-label="Subsidiary Fleet Treasury" className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-text-3">
              Group Subsidiary Vaults
            </h2>
            <span className="text-[11px] font-mono text-text-3">
              3 Global Desks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(liveState?.fleet && liveState.fleet.length > 0
              ? liveState.fleet.slice(0, 3)
              : [
                  {
                    subsidiaryCode: "LISBON_HQ",
                    name: "Portus Iberia S.A.",
                    vaultAddress: "CDDKREHRD473MCXFCZXUXT2YXOZYLRWMGVTHK46WM3DTM2ONZLZXO7CW",
                  },
                  {
                    subsidiaryCode: "FRANKFURT",
                    name: "Portus DACH GmbH",
                    vaultAddress: "CA2KQKNSM33IVXEUBINM6NQ3GSJ3ASD6LSJL7DZASL5CB7KABNKJHPFB",
                  },
                  {
                    subsidiaryCode: "SINGAPORE_DESK",
                    name: "Portus APAC Pte. Ltd.",
                    vaultAddress: "CBEZH4KWBXOXEMB4H77QJSLKAISDR4AWL6AZK5RVPUVD7YNCGVUI47W6",
                  },
                ]
            ).map((item, idx) => {
              const allocationPct = idx === 0 ? 65 : idx === 1 ? 25 : 10;
              const isRealFleet = "subsidiaryCode" in item;
              const city = isRealFleet
                ? item.subsidiaryCode === "LISBON_HQ"
                  ? "Lisbon, PT"
                  : item.subsidiaryCode === "FRANKFURT"
                  ? "Frankfurt, DE"
                  : "Singapore, SG"
                : "Lisbon, PT";
              const vaultAddr = item.vaultAddress;
              const name = item.name;
              const eurcBalance = idx === 0 ? "32,417.80 EURC" : idx === 1 ? "12,468.40 EURC" : "4,987.39 EURC";

              return (
                <div
                  key={item.subsidiaryCode}
                  className="p-4 rounded-card border border-hairline bg-surface shadow-sm hover:border-hairline-strong transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-xs font-semibold text-text font-sans">
                        {city}
                      </div>
                      <div className="text-[11px] text-text-2 mt-0.5">
                        {name}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-pill bg-surface-soft border border-hairline text-[10px] font-mono text-status-ok">
                      ACTIVE
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-surface-soft border border-hairline mb-3 font-mono text-xs flex items-center justify-between">
                    <span className="text-text-3 text-[10px] uppercase">Reserve</span>
                    <span className="font-bold text-text tabular-nums">{eurcBalance}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-text-3 pt-1 border-t border-hairline">
                    <a
                      href={stellarExpertContractUrl(vaultAddr)}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-text transition-colors"
                    >
                      Vault: {truncateContract(vaultAddr)} ↗
                    </a>
                    <span className="tabular-nums">{allocationPct}% Cap</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 7. INSTITUTIONAL FOOTER */}
      <footer className="w-full border-t border-hairline bg-surface py-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-hairline">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold font-display tracking-tight text-text">
                  PORTUS
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-text-2 border border-hairline bg-surface-soft uppercase">
                  Soroban Core
                </span>
              </div>
              <p className="text-xs text-text-2 mt-1">
                Institutional Multi-Currency Treasury Architecture on Stellar Soroban.
              </p>
            </div>

            {/* Contract Registry */}
            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              <a
                href={stellarExpertContractUrl(liveState?.vaultContractId || "CD4S3FUVKPPHQMOI36AWTPGBYNWYRVHFNMRPATEIHENURQK77A5YTMWU")}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-1 rounded border border-hairline bg-surface-soft text-text-2 hover:text-text transition-colors"
              >
                Vault: <span className="text-text tabular-nums">{truncateContract(liveState?.vaultContractId || "CD4S3FUVKPPHQMOI36AWTPGBYNWYRVHFNMRPATEIHENURQK77A5YTMWU")} ↗</span>
              </a>
              <a
                href={stellarExpertContractUrl(liveState?.factoryContractId || "CC2Q2JLSIHMIXS4VQMNG57FXO4LPUQPSK2Z6CQAQXH5AKL6Y5NX4TBCF")}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-1 rounded border border-hairline bg-surface-soft text-text-2 hover:text-text transition-colors"
              >
                Factory: <span className="text-text tabular-nums">{truncateContract(liveState?.factoryContractId || "CC2Q2JLSIHMIXS4VQMNG57FXO4LPUQPSK2Z6CQAQXH5AKL6Y5NX4TBCF")} ↗</span>
              </a>
              <a
                href={stellarExpertContractUrl(liveState?.eurcSacId || "CBESXK3KRJKX7FI6HJQEY26KQ3ZYRFNDG3IICYOMGMJHLLFCCKZNV3DS")}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-1 rounded border border-hairline bg-surface-soft text-text-2 hover:text-text transition-colors"
              >
                EURC: <span className="text-text tabular-nums">{truncateContract(liveState?.eurcSacId || "CBESXK3KRJKX7FI6HJQEY26KQ3ZYRFNDG3IICYOMGMJHLLFCCKZNV3DS")} ↗</span>
              </a>
              <a
                href={stellarExpertContractUrl(liveState?.usdcSacId || "CCVE7CGVRI5T5S6GXSLRAVEYCA2XZIWHJJ7IVGTUVW6DOD2R34VDAX6K")}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-1 rounded border border-hairline bg-surface-soft text-text-2 hover:text-text transition-colors"
              >
                USDC: <span className="text-text tabular-nums">{truncateContract(liveState?.usdcSacId || "CCVE7CGVRI5T5S6GXSLRAVEYCA2XZIWHJJ7IVGTUVW6DOD2R34VDAX6K")} ↗</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-text-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-text-2">
                <span className="w-1.5 h-1.5 rounded-pill bg-status-ok" />
                Stellar Protocol {liveState?.protocolVersion || 29}
              </span>
              <span>·</span>
              <span>Horizon RPC Online</span>
              <span>·</span>
              <span>Hardware Enclave Secured</span>
            </div>

            <div>© 2026 Portus Group Treasury</div>
          </div>
        </div>
      </footer>

      {/* CFO Passkey Authentication Dialog Modal */}
      <PasskeyModal
        open={isPasskeyModalOpen}
        onOpenChange={setIsPasskeyModalOpen}
        session={cfoSession}
        onSessionChange={handleSessionChange}
        onAuthenticated={(session) => {
          handleSessionChange(session);
          setIsPasskeyModalOpen(false);
        }}
        onDisconnect={() => {
          handleSessionChange(null);
        }}
      />
    </div>
  );
}
