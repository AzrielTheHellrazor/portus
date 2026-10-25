import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { getManifest, isBootstrapped } from "@/lib/stellar/config";
import {
  getOrCreateX402ResourceServer,
  CAIP2_STELLAR_TESTNET,
} from "@/lib/x402/facilitator";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

let cachedHandler: ((request: NextRequest) => Promise<NextResponse>) | null = null;
let cachedKey = "";

/**
 * Returns or constructs the withX402-wrapped route handler.
 * Caches by manifest.usdcSacId + manifest.vendorRecipientPublicKey so
 * changes after setup:testnet take effect immediately without server restart.
 */
function getRouteHandler(): (request: NextRequest) => Promise<NextResponse> {
  const manifest = getManifest();
  const currentKey = `${manifest.usdcSacId}:${manifest.vendorRecipientPublicKey}:${manifest.x402FacilitatorPublicKey}`;

  if (cachedHandler && cachedKey === currentKey) {
    return cachedHandler;
  }

  const resourceServer = getOrCreateX402ResourceServer();

  // Route payload returned upon successful 402 settlement
  const innerHandler = async () => {
    return NextResponse.json({
      feed: "Portus Clearinghouse Macro FX Desk",
      pair: "EURC/USDC",
      ecbReferenceRate: "1.0847",
      sdexExecutableAsk: "1.0850",
      spreadBps: 2.8,
      recommendedAction: "EXECUTE_JIT_PATH_PAYMENT",
      confidence: 0.994,
      timestamp: new Date().toISOString(),
    });
  };

  /**
   * Price specification for custom Testnet USDC SAC token:
   * 2.0000000 USDC = 20_000_000 stroops (7 decimals on Stellar).
   * Note: payTo must be manifest.vendorRecipientPublicKey, NOT facilitator!
   */
  cachedHandler = withX402(
    innerHandler,
    {
      "/api/x402/fx-intelligence": {
        accepts: {
          scheme: "exact",
          network: CAIP2_STELLAR_TESTNET,
          price: {
            amount: "20000000",
            asset: manifest.usdcSacId,
            extra: {},
          },
          payTo: manifest.vendorRecipientPublicKey,
          maxTimeoutSeconds: 120,
        },
        description: "Portus Clearinghouse Macro FX Desk Institutional Feed",
      },
    },
    resourceServer
  );

  cachedKey = currentKey;
  return cachedHandler;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const manifest = getManifest();

  if (!isBootstrapped(manifest)) {
    return NextResponse.json(
      {
        error: "Stellar Testnet contracts not bootstrapped yet.",
        detail: "Run `bun run setup:testnet` to deploy Treasury Vault, Factory, and seed accounts.",
        bootstrapped: false,
      },
      { status: 503 }
    );
  }

  const handler = getRouteHandler();
  return handler(request);
}
