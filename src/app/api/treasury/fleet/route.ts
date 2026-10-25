import { NextRequest, NextResponse } from "next/server";
import { deploySubsidiaryVaultOnChain } from "@/lib/stellar/fx-settlement";
import { readLiveTreasuryState } from "@/lib/stellar/state-reader";
import { getRecentAuditReceipts } from "@/lib/treasury/audit-store";
import { INITIAL_FLEET } from "@/data/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface DeployFleetRequestBody {
  subsidiaryCode: string;
  name: string;
  jurisdiction: string;
  executableTag?: string;
}

export async function GET(): Promise<NextResponse> {
  try {
    const receipts = getRecentAuditReceipts();
    const snapshot = await readLiveTreasuryState(receipts);
    return NextResponse.json(
      { fleet: snapshot.fleet ?? INITIAL_FLEET },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("GET /api/treasury/fleet error:", message);
    return NextResponse.json({ fleet: INITIAL_FLEET });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: DeployFleetRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  const { subsidiaryCode, name, jurisdiction, executableTag = "v1_vault" } = body;

  if (!subsidiaryCode || !name || !jurisdiction) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: 'subsidiaryCode', 'name', and 'jurisdiction' must be provided.",
      },
      { status: 400 }
    );
  }

  try {
    const result = await deploySubsidiaryVaultOnChain({
      subsidiaryCode,
      name,
      jurisdiction,
      executableTag,
    });

    return NextResponse.json({
      ok: true,
      subsidiary: result.subsidiary,
      txHash: result.txHash,
      ledger: result.ledgerSequence,
      explorerUrl: result.explorerUrl,
      contractUrl: result.contractUrl,
      isFallback: result.isFallback,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to deploy subsidiary vault:", message);
    return NextResponse.json(
      {
        error: "Subsidiary vault deployment failed",
        detail: message,
      },
      { status: 500 }
    );
  }
}
