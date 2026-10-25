import { NextResponse } from "next/server";
import { readLiveTreasuryState } from "@/lib/stellar/state-reader";
import { getRecentAuditReceipts } from "@/lib/treasury/audit-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const receipts = getRecentAuditReceipts();
    const snapshot = await readLiveTreasuryState(receipts);
    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error reading live treasury state:", message);
    return NextResponse.json(
      { error: "Failed to read live treasury state", detail: message },
      { status: 500 }
    );
  }
}
