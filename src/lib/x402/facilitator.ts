import { createEd25519Signer } from "@x402/stellar";
import { ExactStellarScheme as ExactFacilitatorStellarScheme } from "@x402/stellar/exact/facilitator";
import { ExactStellarScheme as ExactServerStellarScheme } from "@x402/stellar/exact/server";
import { x402Facilitator } from "@x402/core/facilitator";
import { x402ResourceServer, type FacilitatorClient } from "@x402/core/server";
import { getManifest, getServerSecrets } from "@/lib/stellar/config";

export const CAIP2_STELLAR_TESTNET = "stellar:testnet";

interface FacilitatorBundle {
  cacheKey: string;
  facilitator: x402Facilitator;
  facilitatorClient: FacilitatorClient;
  resourceServer: x402ResourceServer;
}

let cachedBundle: FacilitatorBundle | null = null;

/**
 * Creates and caches the in-process x402 facilitator, adapter, and resource server
 * keyed by (manifest.usdcSacId + manifest.x402FacilitatorPublicKey).
 *
 * Critical configuration notes:
 * 1. Facilitator fee ceiling: maxTransactionFeeStroops is set to 10_000_000 (1 XLM)
 *    because Soroban SAC transfers have higher simulation-derived resource fees than
 *    the default 50_000 ceiling in @x402/stellar!
 * 2. Inclusion fee: set to 10_000 stroops to guarantee priority inclusion on Testnet.
 * 3. Invariant: The facilitator address must NEVER be payTo or from.
 *    Facilitator signs the submission envelope and sponsors XLM fees;
 *    the merchant recipient (payTo) is vendorRecipientPublicKey.
 */
export function getOrCreateX402Bundle(): FacilitatorBundle {
  const manifest = getManifest();
  const secrets = getServerSecrets();

  const cacheKey = `${manifest.usdcSacId}:${manifest.x402FacilitatorPublicKey}`;
  if (cachedBundle && cachedBundle.cacheKey === cacheKey) {
    return cachedBundle;
  }

  const facilitatorSecret =
    secrets.x402FacilitatorSecret ||
    process.env.PORTUS_X402_FACILITATOR_SECRET;

  if (!facilitatorSecret) {
    throw new Error(
      "Cannot initialize x402 facilitator: missing PORTUS_X402_FACILITATOR_SECRET in environment or secrets."
    );
  }

  // Ed25519 signer for the facilitator account
  const facilitatorSigner = createEd25519Signer(
    facilitatorSecret,
    CAIP2_STELLAR_TESTNET
  );

  // Configure ExactStellarScheme for facilitator with raised Soroban fee headroom
  const stellarFacilitatorScheme = new ExactFacilitatorStellarScheme(
    [facilitatorSigner],
    {
      maxTransactionFeeStroops: 10_000_000,
      inclusionFeeStroops: 10_000,
      rpcConfig: { url: manifest.rpcUrl },
    }
  );

  // In-process x402Facilitator instance
  const facilitator = new x402Facilitator().register(
    CAIP2_STELLAR_TESTNET,
    stellarFacilitatorScheme
  );

  // In-process FacilitatorClient adapter satisfying @x402/core/server FacilitatorClient interface
  const facilitatorClient: FacilitatorClient = {
    verify: (payload, requirements) =>
      facilitator.verify(payload, requirements),
    settle: (payload, requirements) =>
      facilitator.settle(payload, requirements),
    getSupported: async () =>
      facilitator.getSupported() as unknown as Awaited<
        ReturnType<FacilitatorClient["getSupported"]>
      >,
  };

  // Pre-configured x402ResourceServer using the in-process adapter
  const resourceServer = new x402ResourceServer(facilitatorClient).register(
    CAIP2_STELLAR_TESTNET,
    new ExactServerStellarScheme()
  );

  cachedBundle = {
    cacheKey,
    facilitator,
    facilitatorClient,
    resourceServer,
  };

  return cachedBundle;
}

export function getOrCreateX402ResourceServer(): x402ResourceServer {
  return getOrCreateX402Bundle().resourceServer;
}

export function getOrCreateX402FacilitatorClient(): FacilitatorClient {
  return getOrCreateX402Bundle().facilitatorClient;
}

export function getOrCreateX402Facilitator(): x402Facilitator {
  return getOrCreateX402Bundle().facilitator;
}
