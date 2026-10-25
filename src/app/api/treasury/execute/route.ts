import { NextRequest, NextResponse } from "next/server";
import {
  executeDepartmentFxPayout,
  simulateRoguePolicyBreach,
} from "@/lib/stellar/fx-settlement";
import { executeAutonomousX402Settlement } from "@/lib/x402/agent-buyer";
import { readLiveTreasuryState } from "@/lib/stellar/state-reader";
import {
  appendAuditReceipt,
  getRecentAuditReceipts,
} from "@/lib/treasury/audit-store";
import { getManifest, isBootstrapped } from "@/lib/stellar/config";
import type { DemoScenarioType, SettlementReceipt } from "@/types/treasury";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ExecuteRequestBody {
  scenario: DemoScenarioType;
  breachMode?: "UNAPPROVED_MERCHANT" | "OVER_DAILY_LIMIT";
  usdcAmount?: string;
  destination?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: ExecuteRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  const { scenario, breachMode, usdcAmount } = body;
  const manifest = getManifest();
  const originUrl = new URL(request.url).origin;

  // Verify bootstrap status (simulateRoguePolicyBreach has self-contained simulation logic)
  if (!isBootstrapped(manifest) && scenario !== "ROGUE_BREACH_BLOCKED") {
    return NextResponse.json(
      {
        error: "Portus Treasury Vault is pending bootstrap. Please run `bun run setup:testnet` first.",
        notBootstrapped: true,
      },
      { status: 503 }
    );
  }

  let receipt: SettlementReceipt;

  try {
    switch (scenario) {
      case "DEPARTMENT_FX_PAYOUT": {
        receipt = await executeDepartmentFxPayout({ usdcAmount });
        break;
      }

      case "AGENT_X402_SETTLEMENT": {
        receipt = await executeAutonomousX402Settlement(originUrl);
        break;
      }

      case "ROGUE_BREACH_BLOCKED": {
        receipt = await simulateRoguePolicyBreach({ breachMode });
        break;
      }

      default: {
        return NextResponse.json(
          { error: `Unknown scenario: ${scenario}` },
          { status: 400 }
        );
      }
    }

    appendAuditReceipt(receipt);
    const updatedState = await readLiveTreasuryState(getRecentAuditReceipts());
    return NextResponse.json({ receipt, state: updatedState });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Execution error for scenario ${scenario}:`, message);

    // Detect OpenZeppelin Pausable emergency freeze (VaultPaused / #3)
    const isPausedError =
      message.includes("VaultPaused") ||
      message.includes("#3") ||
      message.includes("Contract, #3") ||
      message.includes("Contract, 3");

    if (isPausedError) {
      const pausedReceipt: SettlementReceipt = {
        id: `RCPT-${Date.now()}-PAUSED`,
        timestamp: new Date().toISOString(),
        scenario,
        status: "BLOCKED_BY_POLICY",
        policyId:
          scenario === "DEPARTMENT_FX_PAYOUT"
            ? "DEPT_OPS"
            : "AGENT_FX",
        spenderLabel:
          scenario === "DEPARTMENT_FX_PAYOUT"
            ? "Operations Spender"
            : "Autonomous FX Liquidity Agent",
        merchantAddress: manifest.vendorRecipientPublicKey,
        errorCode: "VaultError::VaultPaused (#3)",
        errorDetail:
          "Transaction rejected by OpenZeppelin Pausable: Treasury Vault is currently frozen by CFO passkey emergency freeze.",
      };

      appendAuditReceipt(pausedReceipt);
      const updatedState = await readLiveTreasuryState(getRecentAuditReceipts());
      return NextResponse.json({ receipt: pausedReceipt, state: updatedState });
    }

    return NextResponse.json(
      {
        error: "Execution scenario failed",
        scenario,
        detail: message,
      },
      { status: 500 }
    );
  }
}
