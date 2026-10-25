import {
  decodePaymentRequiredHeader,
  decodePaymentResponseHeader,
  decodePaymentSignatureHeader,
} from "@x402/core/http";
import { x402Client } from "@x402/core/client";
import { wrapFetchWithPayment } from "@x402/fetch";
import { ExactStellarScheme } from "@x402/stellar/exact/client";
import { createEd25519Signer } from "@x402/stellar";
import {
  getManifest,
  getServerSecrets,
  explorerTxUrl,
  isBootstrapped,
} from "@/lib/stellar/config";
import { provisionAgentUsdcViaVaultAndSdex } from "@/lib/stellar/fx-settlement";
import type { SettlementReceipt, X402WireStep } from "@/types/treasury";
import { CAIP2_STELLAR_TESTNET } from "./facilitator";

/**
 * Orchestrates the full autonomous agent payment cycle:
 *
 * Wire Step 1: Initial unpaid GET request to /api/x402/fx-intelligence
 *              -> Server responds with HTTP 402 + PAYMENT-REQUIRED header.
 * Wire Step 2: On-chain Soroban Treasury Vault policy check for AGENT_FX
 *              -> Checks daily limit & merchant whitelist, emits audit event.
 * Wire Step 3: Native SDEX JIT swap (EURC -> USDC pathPaymentStrictReceive)
 *              -> Credits 2.0000000 USDC buffer directly to agentSpender.
 * Wire Step 4: Autonomous agent signs contract auth entry, wrapFetchWithPayment
 *              retries request with PAYMENT-SIGNATURE -> In-process facilitator
 *              submits on-chain USDC transfer and returns HTTP 200 + PAYMENT-RESPONSE.
 */
export async function executeAutonomousX402Settlement(
  originUrl: string
): Promise<SettlementReceipt> {
  const manifest = getManifest();
  if (!isBootstrapped(manifest)) {
    throw new Error(
      "Portus Treasury Vault has not been bootstrapped on Stellar Testnet yet. Run `bun run setup:testnet` first."
    );
  }

  const secrets = getServerSecrets();
  const agentSpenderSecret =
    secrets.agentSpenderSecret || process.env.PORTUS_AGENT_SPENDER_SECRET;

  if (!agentSpenderSecret) {
    throw new Error(
      "Missing PORTUS_AGENT_SPENDER_SECRET in environment or server secrets."
    );
  }

  const targetUrl = `${originUrl.replace(/\/+$/, "")}/api/x402/fx-intelligence`;

  // --------------------------------------------------------------------------
  // WIRE STEP 1: Client -> Server unpaid request (HTTP 402 challenge)
  // --------------------------------------------------------------------------
  const t0 = performance.now();
  const challengeRes = await fetch(targetUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent": "PortusAutonomousAgent/2.4 (x402-v2; stellar-sac)",
    },
    cache: "no-store",
  });
  const durationStep1 = Math.max(1, Math.round(performance.now() - t0));

  if (challengeRes.status !== 402) {
    const errorText = await challengeRes.text();
    throw new Error(
      `Expected HTTP 402 Payment Required from ${targetUrl}, received HTTP ${challengeRes.status}: ${errorText}`
    );
  }

  const rawPaymentRequired =
    challengeRes.headers.get("payment-required") ||
    challengeRes.headers.get("PAYMENT-REQUIRED");

  if (!rawPaymentRequired) {
    throw new Error(
      "Endpoint responded with HTTP 402 but omitted the standard PAYMENT-REQUIRED header."
    );
  }

  const decodedPaymentRequired = decodePaymentRequiredHeader(rawPaymentRequired);

  const step1Trace: X402WireStep = {
    step: 1,
    direction: "SERVER_TO_CLIENT",
    title: "Gateway returns HTTP 402 Payment Required with Stellar SAC specs",
    httpStatus: 402,
    headers: {
      "payment-required": rawPaymentRequired,
      "content-type": challengeRes.headers.get("content-type") || "application/json",
    },
    decodedPayload: decodedPaymentRequired as unknown as Record<string, unknown>,
    durationMs: durationStep1,
  };

  // --------------------------------------------------------------------------
  // WIRE STEP 2 & 3: Just-In-Time Treasury Provisioning (Vault + Native SDEX)
  // --------------------------------------------------------------------------
  const tProvision = performance.now();
  const provisionResult = await provisionAgentUsdcViaVaultAndSdex({
    usdcAmount: "2.0000000",
    payToMerchant: manifest.vendorRecipientPublicKey,
  });
  const durationProvision = Math.max(2, Math.round(performance.now() - tProvision));
  const halfProvisionDuration = Math.round(durationProvision / 2);

  const step2Trace: X402WireStep = {
    step: 2,
    direction: "VAULT_ONCHAIN",
    title: "Soroban Vault evaluates spend policy & releases EURC atomically",
    txHash: provisionResult.sorobanPolicyTxHash,
    decodedPayload: {
      policyId: "AGENT_FX",
      role: "AUTONOMOUS_AGENT",
      spenderAddress: manifest.agentSpenderPublicKey,
      merchantAddress: manifest.vendorRecipientPublicKey,
      authorizedAmountUsdc: "2.0000000",
      ledgerSequence: provisionResult.ledgerSequence,
      status: "APPROVED_WITHIN_DAILY_CAP",
    },
    durationMs: halfProvisionDuration,
  };

  const step3Trace: X402WireStep = {
    step: 3,
    direction: "SDEX_FX",
    title: `Native SDEX executes pathPaymentStrictReceive (${provisionResult.eurcDebited} EURC -> 2.0000 USDC)`,
    txHash: provisionResult.sdexPathPaymentTxHash,
    decodedPayload: {
      sourceAsset: `${manifest.eurcAssetCode} (${manifest.eurcSacId.slice(0, 8)}...SAC)`,
      destAsset: `${manifest.usdcAssetCode} (${manifest.usdcSacId.slice(0, 8)}...SAC)`,
      sourceAmountDebited: provisionResult.eurcDebited,
      destAmountDelivered: provisionResult.usdcReceived || "2.0000000",
      clearingRate: provisionResult.effectiveFxRate,
      ledgerSequence: provisionResult.ledgerSequence,
    },
    durationMs: halfProvisionDuration,
  };

  // --------------------------------------------------------------------------
  // WIRE STEP 4: Signed x402 Payment Retry & In-Process Facilitator Settlement
  // --------------------------------------------------------------------------
  const buyerSigner = createEd25519Signer(
    agentSpenderSecret,
    CAIP2_STELLAR_TESTNET
  );

  const stellarClientScheme = new ExactStellarScheme(buyerSigner, {
    url: manifest.rpcUrl,
  });

  // Client configured with spendControls: false to allow our custom SAC asset and >$1 amount
  const buyerClient = x402Client.fromConfig({
    schemes: [{ network: CAIP2_STELLAR_TESTNET, client: stellarClientScheme }],
    spendControls: false,
  });

  let capturedPaymentSignature: string | undefined;

  // Inner fetch wrapper intercepts the outgoing PAYMENT-SIGNATURE header
  const customInnerFetch = (async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    const reqHeaders = new Headers(init?.headers);
    const sig =
      reqHeaders.get("payment-signature") ||
      reqHeaders.get("PAYMENT-SIGNATURE");
    if (sig) {
      capturedPaymentSignature = sig;
    }
    return fetch(input, init);
  }) as typeof globalThis.fetch;

  const payingFetch = wrapFetchWithPayment(customInnerFetch, buyerClient);

  const tSettlement = performance.now();
  const paidRes = await payingFetch(targetUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent": "PortusAutonomousAgent/2.4 (x402-v2; stellar-sac)",
    },
    cache: "no-store",
  });
  const durationSettlement = Math.max(1, Math.round(performance.now() - tSettlement));

  if (!paidRes.ok) {
    const errorBody = await paidRes.text();
    throw new Error(
      `x402 paid settlement failed with HTTP ${paidRes.status}: ${errorBody}`
    );
  }

  const rawPaymentResponse =
    paidRes.headers.get("payment-response") ||
    paidRes.headers.get("PAYMENT-RESPONSE");

  if (!rawPaymentResponse) {
    throw new Error(
      "Paid response returned 200 OK but omitted the standard PAYMENT-RESPONSE header."
    );
  }

  const decodedPaymentResponse = decodePaymentResponseHeader(rawPaymentResponse);
  const x402SettlementTxHash = decodedPaymentResponse.transaction;
  const intelligencePayload = await paidRes.json();

  let decodedSignaturePayload: Record<string, unknown> | undefined;
  if (capturedPaymentSignature) {
    try {
      decodedSignaturePayload = decodePaymentSignatureHeader(
        capturedPaymentSignature
      ) as unknown as Record<string, unknown>;
    } catch {
      // Non-fatal if signature payload parse fails for display
    }
  }

  const step4Headers: Record<string, string> = {
    "payment-response": rawPaymentResponse,
    "content-type": paidRes.headers.get("content-type") || "application/json",
  };
  if (capturedPaymentSignature) {
    step4Headers["payment-signature"] = capturedPaymentSignature;
  }

  const step4Trace: X402WireStep = {
    step: 4,
    direction: "SERVER_TO_CLIENT",
    title: "x402 Facilitator settles signed USDC transfer on Testnet (200 OK)",
    httpStatus: 200,
    headers: step4Headers,
    decodedPayload: {
      settlementResponse: decodedPaymentResponse as unknown as Record<string, unknown>,
      ...(decodedSignaturePayload ? { signaturePayload: decodedSignaturePayload } : {}),
    },
    txHash: x402SettlementTxHash,
    durationMs: durationSettlement,
  };

  const receiptId = `RCPT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const receipt: SettlementReceipt = {
    id: receiptId,
    timestamp: new Date().toISOString(),
    scenario: "AGENT_X402_SETTLEMENT",
    status: "SETTLED",
    policyId: "AGENT_FX",
    spenderLabel: "Autonomous FX Liquidity Agent",
    merchantAddress: manifest.vendorRecipientPublicKey,
    sorobanPolicyTxHash: provisionResult.sorobanPolicyTxHash,
    sdexPathPaymentTxHash: provisionResult.sdexPathPaymentTxHash,
    x402SettlementTxHash,
    eurcDebited: provisionResult.eurcDebited,
    usdcDelivered: provisionResult.usdcReceived || "2.0000000",
    effectiveFxRate: provisionResult.effectiveFxRate,
    ledgerSequence: provisionResult.ledgerSequence,
    explorerUrl: explorerTxUrl(x402SettlementTxHash),
    x402WireTrace: [step1Trace, step2Trace, step3Trace, step4Trace],
    intelligencePayload,
  };

  return receipt;
}
