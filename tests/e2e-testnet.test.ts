import { describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { GET as getTreasuryState } from "@/app/api/treasury/state/route";
import { POST as executeTreasuryScenario } from "@/app/api/treasury/execute/route";
import { POST as updateTreasuryPolicy } from "@/app/api/treasury/policy/route";
import { GET as getX402FxIntelligence } from "@/app/api/x402/fx-intelligence/route";
import { GET as getFleet, POST as deploySubsidiary } from "@/app/api/treasury/fleet/route";
import { getManifest, isBootstrapped } from "@/lib/stellar/config";
import type { SettlementReceipt, TreasuryStateSnapshot } from "@/types/treasury";

describe("Portus Live Stellar Testnet End-to-End Suite", () => {
  test("1. Manifest and live Stellar Testnet state snapshot are fully provisioned", async () => {
    const manifest = getManifest();
    expect(isBootstrapped(manifest)).toBe(true);
    expect(manifest.treasuryVaultId).toMatch(/^C[A-Z0-9]{55}$/);
    expect(manifest.vaultFactoryId).toMatch(/^C[A-Z0-9]{55}$/);
    expect(manifest.eurcSacId).toMatch(/^C[A-Z0-9]{55}$/);
    expect(manifest.usdcSacId).toMatch(/^C[A-Z0-9]{55}$/);
    expect(manifest.subsidiaryVaults.length).toBeGreaterThanOrEqual(2);

    const res = await getTreasuryState();
    expect(res.status).toBe(200);
    const snapshot = (await res.json()) as TreasuryStateSnapshot;
    expect(snapshot.network).toBe("testnet");
    expect(snapshot.protocolVersion).toBeGreaterThanOrEqual(28);
    expect(snapshot.latestLedger).toBeGreaterThan(0);
    expect(Number(snapshot.balances.vaultEurc)).toBeGreaterThan(40000);
    expect(snapshot.policies.length).toBeGreaterThanOrEqual(2);
    expect(snapshot.fleet.length).toBeGreaterThanOrEqual(2);

    // Verify CAP-0086 sparse policy fields on AGENT_FX vs DEPT_OPS
    const deptOps = snapshot.policies.find((p) => p.policyId === "DEPT_OPS");
    const agentFx = snapshot.policies.find((p) => p.policyId === "AGENT_FX");
    expect(deptOps).toBeDefined();
    expect(deptOps?.costCenter).toBe("PT-OPS-01");
    expect(agentFx).toBeDefined();
    expect(agentFx?.costCenter).toBeUndefined();
  }, 45_000);

  test("2. Scenario 3 — Rogue Policy Breach is deterministically rejected by Soroban VM on Testnet", async () => {
    const req = new NextRequest("http://localhost:4400/api/treasury/execute", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        scenario: "ROGUE_BREACH_BLOCKED",
        breachMode: "UNAPPROVED_MERCHANT",
      }),
    });

    const res = await executeTreasuryScenario(req);
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      receipt: SettlementReceipt;
      state: TreasuryStateSnapshot;
    };

    expect(data.receipt.status).toBe("BLOCKED_BY_POLICY");
    expect(data.receipt.errorCode).toContain("MerchantNotWhitelisted");
    expect(data.receipt.ledgerSequence).toBeGreaterThan(0);
  }, 45_000);

  test("3. Scenario 1 — Human Department EURC -> Native DEX -> Exact USDC Payout settles on Stellar Testnet", async () => {
    const req = new NextRequest("http://localhost:4400/api/treasury/execute", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        scenario: "DEPARTMENT_FX_PAYOUT",
        usdcAmount: "25.0000000",
      }),
    });

    const res = await executeTreasuryScenario(req);
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      receipt: SettlementReceipt;
      state: TreasuryStateSnapshot;
    };

    expect(data.receipt.status).toBe("SETTLED");
    expect(data.receipt.sorobanPolicyTxHash).toMatch(/^[0-9a-f]{64}$/);
    expect(data.receipt.sdexPathPaymentTxHash).toMatch(/^[0-9a-f]{64}$/);
    expect(Number(data.receipt.usdcDelivered)).toBeCloseTo(25, 4);
    expect(Number(data.receipt.eurcDebited)).toBeGreaterThan(20);
  }, 90_000);

  test("4. Scenario 2 — Autonomous x402 v2 Agent settles HTTP 402 -> Vault EURC -> SDEX -> SAC USDC -> 200 OK", async () => {
    // Start an ephemeral local HTTP server exposing /api/x402/fx-intelligence so wrapFetchWithPayment runs over real HTTP wire
    const server = Bun.serve({
      port: 0,
      async fetch(request) {
        const url = new URL(request.url);
        if (url.pathname === "/api/x402/fx-intelligence") {
          return getX402FxIntelligence(new NextRequest(request));
        }
        return new Response("Not Found", { status: 404 });
      },
    });

    try {
      const origin = `http://127.0.0.1:${server.port}`;

      // Verify unpaid challenge returns authentic HTTP 402 + PAYMENT-REQUIRED header
      const unpaid = await fetch(`${origin}/api/x402/fx-intelligence`);
      expect(unpaid.status).toBe(402);
      expect(unpaid.headers.get("payment-required")).toBeTruthy();

      // Execute full autonomous x402 settlement via /api/treasury/execute
      const execReq = new NextRequest(`${origin}/api/treasury/execute`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scenario: "AGENT_X402_SETTLEMENT" }),
      });

      const execRes = await executeTreasuryScenario(execReq);
      expect(execRes.status).toBe(200);
      const data = (await execRes.json()) as {
        receipt: SettlementReceipt;
        state: TreasuryStateSnapshot;
      };

      expect(data.receipt.status).toBe("SETTLED");
      expect(data.receipt.sorobanPolicyTxHash).toMatch(/^[0-9a-f]{64}$/);
      expect(data.receipt.sdexPathPaymentTxHash).toMatch(/^[0-9a-f]{64}$/);
      expect(data.receipt.x402SettlementTxHash).toMatch(/^[0-9a-f]{64}$/);
      expect(data.receipt.x402WireTrace?.length).toBe(4);
      expect(data.receipt.intelligencePayload?.pair).toBe("EURC/USDC");
    } finally {
      server.stop(true);
    }
  }, 120_000);

  test("5. OpenZeppelin Pausable Governance — Emergency Freeze blocks spend and Unpause restores operations", async () => {
    // Freeze vault
    const freezeReq = new NextRequest("http://localhost:4400/api/treasury/policy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "SET_PAUSE", paused: true }),
    });
    const freezeRes = await updateTreasuryPolicy(freezeReq);
    expect(freezeRes.status).toBe(200);
    const freezeJson = await freezeRes.json();
    expect(freezeJson.state.paused).toBe(true);

    // Attempt payout while paused -> blocked on-chain with VaultPaused (#3)
    const blockedReq = new NextRequest("http://localhost:4400/api/treasury/execute", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        scenario: "DEPARTMENT_FX_PAYOUT",
        usdcAmount: "10.0000000",
      }),
    });
    const blockedRes = await executeTreasuryScenario(blockedReq);
    expect(blockedRes.status).toBe(200);
    const blockedJson = await blockedRes.json();
    expect(blockedJson.receipt.status).toBe("BLOCKED_BY_POLICY");
    expect(blockedJson.receipt.errorCode).toContain("VaultPaused");

    // Unpause vault so live demo remains active for judges!
    const unfreezeReq = new NextRequest("http://localhost:4400/api/treasury/policy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "SET_PAUSE", paused: false }),
    });
    const unfreezeRes = await updateTreasuryPolicy(unfreezeReq);
    expect(unfreezeRes.status).toBe(200);
    const unfreezeJson = await unfreezeRes.json();
    expect(unfreezeJson.state.paused).toBe(false);
  }, 120_000);

  test("6. CAP-0085 Subsidiary Vault Deployment — Factory deploys regional vault sharing Wasm executable tag", async () => {
    const listRes = await getFleet();
    expect(listRes.status).toBe(200);
    const listJson = await listRes.json();
    expect(listJson.fleet.length).toBeGreaterThanOrEqual(2);

    const testCode = `TEST_${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const deployReq = new NextRequest("http://localhost:4400/api/treasury/fleet", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        subsidiaryCode: testCode,
        name: `Portus ${testCode} Operations`,
        jurisdiction: "Lisbon, PT",
        executableTag: "v1_vault",
      }),
    });

    const deployRes = await deploySubsidiary(deployReq);
    expect(deployRes.status).toBe(200);
    const deployJson = await deployRes.json();

    expect(deployJson.ok).toBe(true);
    expect(deployJson.subsidiary).toBeDefined();
    expect(deployJson.subsidiary.subsidiaryCode).toBe(testCode);
    expect(deployJson.subsidiary.vaultAddress).toMatch(/^C[A-Z0-9]{55}$/);
    expect(deployJson.subsidiary.executableTag).toBe("v1_vault");
    expect(deployJson.txHash).toMatch(/^[0-9a-f]{64}$/);
    expect(deployJson.ledger).toBeGreaterThan(5000000);
    expect(deployJson.explorerUrl).toContain("stellar.expert");
    expect(deployJson.contractUrl).toContain("stellar.expert");
  }, 120_000);
});
