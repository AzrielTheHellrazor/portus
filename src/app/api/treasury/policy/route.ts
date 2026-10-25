import { NextRequest, NextResponse } from "next/server";
import { updateVaultGovernance } from "@/lib/stellar/fx-settlement";
import { readLiveTreasuryState } from "@/lib/stellar/state-reader";
import { getRecentAuditReceipts } from "@/lib/treasury/audit-store";
import { getManifest, isBootstrapped } from "@/lib/stellar/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface PolicyRequestBody {
  action: "SET_PAUSE" | "UPDATE_DAILY_LIMIT";
  paused?: boolean;
  policyId?: string;
  newDailyLimitUsdc?: string;
  passkeyAssertion?: Record<string, unknown>;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: PolicyRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  const { action, paused, policyId, newDailyLimitUsdc, passkeyAssertion } = body;
  const manifest = getManifest();

  if (!isBootstrapped(manifest)) {
    return NextResponse.json(
      {
        error: "Portus Treasury Vault is pending bootstrap. Please run `bun run setup:testnet` first.",
        notBootstrapped: true,
      },
      { status: 503 }
    );
  }

  if (action !== "SET_PAUSE" && action !== "UPDATE_DAILY_LIMIT") {
    return NextResponse.json(
      { error: `Invalid action '${action}'. Expected 'SET_PAUSE' or 'UPDATE_DAILY_LIMIT'.` },
      { status: 400 }
    );
  }

  try {
    const txResult = await updateVaultGovernance({
      action,
      paused,
      policyId,
      newDailyLimitUsdc,
    });

    const refreshedState = await readLiveTreasuryState(getRecentAuditReceipts());

    return NextResponse.json({
      ok: true,
      ...txResult,
      passkeyVerified: Boolean(passkeyAssertion),
      state: refreshedState,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Governance update failed for action ${action}:`, message);

    return NextResponse.json(
      {
        error: "Governance policy update failed",
        action,
        detail: message,
      },
      { status: 500 }
    );
  }
}
