import fs from "node:fs";
import path from "node:path";
import * as StellarSdk from "@stellar/stellar-sdk";
import type {
  ContractManifest,
  SpendPolicy,
  SubsidiaryVaultRecord,
} from "@/types/treasury";

export const STELLAR_RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ||
  "https://soroban-testnet.stellar.org";

export const STELLAR_HORIZON_URL =
  process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ||
  "https://horizon-testnet.stellar.org";

export const STELLAR_NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

export const rpcServer = new StellarSdk.rpc.Server(STELLAR_RPC_URL);
export const horizonServer = new StellarSdk.Horizon.Server(STELLAR_HORIZON_URL);

const DEFAULT_MANIFEST_PATH = path.join(
  process.cwd(),
  "src",
  "lib",
  "contracts",
  "manifest.json"
);

const FALLBACK_MANIFEST: ContractManifest = {
  network: "testnet",
  rpcUrl: STELLAR_RPC_URL,
  horizonUrl: STELLAR_HORIZON_URL,
  networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  protocolVersion: 29,
  treasuryVaultId: "PENDING_BOOTSTRAP",
  vaultFactoryId: "PENDING_BOOTSTRAP",
  treasuryVaultWasmHash: "PENDING_BOOTSTRAP",
  eurcSacId: "PENDING_BOOTSTRAP",
  usdcSacId: "PENDING_BOOTSTRAP",
  eurcAssetCode: "EURC",
  usdcAssetCode: "USDC",
  issuerPublicKey: "PENDING_BOOTSTRAP",
  cfoAdminPublicKey: "PENDING_BOOTSTRAP",
  opsSpenderPublicKey: "PENDING_BOOTSTRAP",
  agentSpenderPublicKey: "PENDING_BOOTSTRAP",
  vendorRecipientPublicKey: "PENDING_BOOTSTRAP",
  x402FacilitatorPublicKey: "PENDING_BOOTSTRAP",
  subsidiaryVaults: [],
  seededAt: "PENDING_BOOTSTRAP",
};

/**
 * Loads the contract manifest freshly from disk when in Node/Server environments,
 * with fallback to imported JSON or default structure so that changes made by
 * `setup:testnet` are immediately visible without rebuild/restart.
 */
export function getManifest(): ContractManifest {
  try {
    if (typeof fs !== "undefined" && typeof fs.readFileSync === "function") {
      const candidates = [
        DEFAULT_MANIFEST_PATH,
        path.resolve(__dirname, "../contracts/manifest.json"),
        path.resolve(process.cwd(), "manifest.json"),
      ];
      for (const p of candidates) {
        if (fs.existsSync(/*turbopackIgnore: true*/ p)) {
          const raw = fs.readFileSync(/*turbopackIgnore: true*/ p, "utf-8");
          const parsed = JSON.parse(raw);
          return {
            ...FALLBACK_MANIFEST,
            ...parsed,
          };
        }
      }
    }
  } catch {
    // Fall back to static manifest
  }
  return FALLBACK_MANIFEST;
}

/**
 * Checks whether the testnet treasury vault has been deployed and bootstrapped.
 */
export function isBootstrapped(manifest?: ContractManifest): boolean {
  const m = manifest || getManifest();
  return (
    typeof m.treasuryVaultId === "string" &&
    m.treasuryVaultId.startsWith("C") &&
    m.treasuryVaultId !== "PENDING_BOOTSTRAP"
  );
}

export interface ServerSecrets {
  issuerSecret?: string;
  lpSecret?: string;
  cfoAdminSecret?: string;
  opsSpenderSecret?: string;
  agentSpenderSecret?: string;
  vendorRecipientSecret?: string;
  x402FacilitatorSecret?: string;
  issuerKeypair?: StellarSdk.Keypair;
  lpKeypair?: StellarSdk.Keypair;
  cfoAdminKeypair?: StellarSdk.Keypair;
  opsSpenderKeypair?: StellarSdk.Keypair;
  agentSpenderKeypair?: StellarSdk.Keypair;
  vendorRecipientKeypair?: StellarSdk.Keypair;
  x402FacilitatorKeypair?: StellarSdk.Keypair;
}

/**
 * Reads server-side demo secret keys from process.env, falling back to reading
 * `/Users/goktus/portus/.env.local` directly via `node:fs` if executed in test runner / CLI.
 */
export function getServerSecrets(): ServerSecrets {
  const env: Record<string, string | undefined> = { ...process.env };

  try {
    if (typeof fs !== "undefined" && typeof fs.readFileSync === "function") {
      const envPath = path.join(process.cwd(), ".env.local");
      if (fs.existsSync(/*turbopackIgnore: true*/ envPath)) {
        const lines = fs.readFileSync(/*turbopackIgnore: true*/ envPath, "utf-8").split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            if (!env[key] && val) {
              env[key] = val;
            }
          }
        }
      }
    }
  } catch {
    // Ignore .env.local parse errors
  }

  const safeKeypair = (secret?: string): StellarSdk.Keypair | undefined => {
    if (!secret || !secret.startsWith("S") || secret.length !== 56) return undefined;
    try {
      return StellarSdk.Keypair.fromSecret(secret);
    } catch {
      return undefined;
    }
  };

  const issuerSecret = env.PORTUS_ISSUER_SECRET;
  const lpSecret = env.PORTUS_LP_SECRET;
  const cfoAdminSecret = env.PORTUS_CFO_ADMIN_SECRET;
  const opsSpenderSecret = env.PORTUS_OPS_SPENDER_SECRET;
  const agentSpenderSecret = env.PORTUS_AGENT_SPENDER_SECRET;
  const vendorRecipientSecret = env.PORTUS_VENDOR_RECIPIENT_SECRET;
  const x402FacilitatorSecret = env.PORTUS_X402_FACILITATOR_SECRET;

  return {
    issuerSecret,
    lpSecret,
    cfoAdminSecret,
    opsSpenderSecret,
    agentSpenderSecret,
    vendorRecipientSecret,
    x402FacilitatorSecret,
    issuerKeypair: safeKeypair(issuerSecret),
    lpKeypair: safeKeypair(lpSecret),
    cfoAdminKeypair: safeKeypair(cfoAdminSecret),
    opsSpenderKeypair: safeKeypair(opsSpenderSecret),
    agentSpenderKeypair: safeKeypair(agentSpenderSecret),
    vendorRecipientKeypair: safeKeypair(vendorRecipientSecret),
    x402FacilitatorKeypair: safeKeypair(x402FacilitatorSecret),
  };
}

/**
 * Converts decimal amount string or number to stroops (7 decimals, 10^7).
 * E.g. "125.0000000" -> 1250000000n
 */
export function toStroops(decimalAmount: string | number): bigint {
  const str =
    typeof decimalAmount === "number"
      ? decimalAmount.toFixed(7)
      : decimalAmount.trim();
  const [intPart = "0", decPart = ""] = str.split(".");
  const paddedDec = decPart.padEnd(7, "0").slice(0, 7);
  const isNeg = intPart.startsWith("-");
  const absInt = intPart.replace("-", "");
  const total =
    BigInt(absInt || "0") * BigInt(10000000) + BigInt(paddedDec || "0");
  return isNeg ? -total : total;
}

/**
 * Converts stroops (bigint, string, or number) to a 7-decimal formatted string.
 * E.g. 1250000000n -> "125.0000000"
 */
export function fromStroops(stroops: bigint | string | number): string {
  const val = BigInt(stroops);
  const zero = BigInt(0);
  const tenMillion = BigInt(10000000);
  const isNeg = val < zero;
  const absVal = isNeg ? -val : val;
  const intPart = absVal / tenMillion;
  const decPart = (absVal % tenMillion).toString().padStart(7, "0");
  return `${isNeg ? "-" : ""}${intPart.toString()}.${decPart}`;
}

export function explorerTxUrl(txHash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}

export function explorerContractUrl(contractId: string): string {
  return `https://stellar.expert/explorer/testnet/contract/${contractId}`;
}

export function explorerAccountUrl(accountId: string): string {
  return `https://stellar.expert/explorer/testnet/account/${accountId}`;
}

/**
 * Soroban SpendPolicyData input format for upsert_policy.
 */
export interface SpendPolicyDataInput {
  allowedMerchants: string[];
  costCenter?: string | null;
  dailyLimitStroops: bigint;
  isActive: boolean;
  label: string;
  maxSingleTxStroops?: bigint | null;
  periodResetTs: bigint | number;
  policyId: string;
  role: "HUMAN" | "AGENT";
  spender: string;
  spentTodayStroops: bigint;
}

/**
 * Encodes a SpendPolicyData struct into a Soroban ScVal with STRICTLY ALPHABETICAL keys:
 * 1. allowed_merchants: Vec<Address>
 * 2. cost_center: Option<String>
 * 3. daily_limit_stroops: i128
 * 4. is_active: bool
 * 5. label: String
 * 6. max_single_tx_stroops: Option<i128>
 * 7. period_reset_ts: u64
 * 8. policy_id: Symbol
 * 9. role: Symbol
 * 10. spender: Address
 * 11. spent_today_stroops: i128
 */
export function encodeSpendPolicyScVal(
  policy: SpendPolicyDataInput
): StellarSdk.xdr.ScVal {
  const { xdr, nativeToScVal, Address } = StellarSdk;

  const entries: StellarSdk.xdr.ScMapEntry[] = [
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("allowed_merchants"),
      val: xdr.ScVal.scvVec(
        policy.allowedMerchants.map((addr) => new Address(addr).toScVal())
      ),
    }),
    // CAP-0086 sparse struct mapping: omit absent Option<T> keys on-wire
    ...(policy.costCenter
      ? [
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("cost_center"),
            val: nativeToScVal(policy.costCenter, { type: "string" }),
          }),
        ]
      : []),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("daily_limit_stroops"),
      val: nativeToScVal(policy.dailyLimitStroops, { type: "i128" }),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("is_active"),
      val: nativeToScVal(Boolean(policy.isActive), { type: "bool" }),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("label"),
      val: nativeToScVal(policy.label, { type: "string" }),
    }),
    ...(policy.maxSingleTxStroops != null
      ? [
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("max_single_tx_stroops"),
            val: nativeToScVal(policy.maxSingleTxStroops, { type: "i128" }),
          }),
        ]
      : []),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("period_reset_ts"),
      val: nativeToScVal(BigInt(policy.periodResetTs), { type: "u64" }),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("policy_id"),
      val: xdr.ScVal.scvSymbol(policy.policyId),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("role"),
      val: xdr.ScVal.scvSymbol(policy.role),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("spender"),
      val: new Address(policy.spender).toScVal(),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("spent_today_stroops"),
      val: nativeToScVal(policy.spentTodayStroops, { type: "i128" }),
    }),
  ];

  return xdr.ScVal.scvMap(entries);
}

/**
 * Decodes native Soroban SpendPolicyData return value into Portus SpendPolicy.
 */
export function decodeSpendPolicyNative(raw: Record<string, any>): SpendPolicy {
  const roleRaw = raw.role?.toString?.() || "HUMAN";
  const role =
    roleRaw === "HUMAN" || roleRaw === "HUMAN_DEPARTMENT"
      ? "HUMAN_DEPARTMENT"
      : "AUTONOMOUS_AGENT";

  const allowedMerchants: string[] = Array.isArray(raw.allowed_merchants)
    ? raw.allowed_merchants.map((m: any) => m?.toString?.() ?? String(m))
    : [];

  return {
    policyId: raw.policy_id?.toString?.() || "",
    label: raw.label?.toString?.() || "",
    role,
    spenderAddress: raw.spender?.toString?.() || "",
    dailyLimitUsdc: fromStroops(raw.daily_limit_stroops ?? BigInt(0)),
    spentTodayUsdc: fromStroops(raw.spent_today_stroops ?? BigInt(0)),
    maxSingleTxUsdc:
      raw.max_single_tx_stroops != null
        ? fromStroops(raw.max_single_tx_stroops)
        : undefined,
    costCenter: raw.cost_center ? String(raw.cost_center) : undefined,
    periodResetTimestamp: Number(raw.period_reset_ts ?? 0),
    allowedMerchants,
    isActive: Boolean(raw.is_active),
  };
}

/**
 * Decodes native Soroban SubsidiaryRecord into Portus SubsidiaryVaultRecord.
 */
export function decodeSubsidiaryRecordNative(
  raw: Record<string, any>
): SubsidiaryVaultRecord {
  const wasmHashRaw = raw.wasm_hash;
  const wasmHash =
    Buffer.isBuffer(wasmHashRaw) || wasmHashRaw instanceof Uint8Array
      ? Buffer.from(wasmHashRaw).toString("hex")
      : String(wasmHashRaw ?? "");

  return {
    subsidiaryCode: raw.subsidiary_code?.toString?.() || "",
    name: raw.name?.toString?.() || "",
    jurisdiction: raw.jurisdiction?.toString?.() || "",
    vaultAddress: raw.vault_address?.toString?.() || "",
    executableTag: raw.executable_tag?.toString?.() || "",
    wasmHash,
    deployedLedger: raw.deployed_ledger ? Number(raw.deployed_ledger) : undefined,
  };
}

export const VAULT_ERROR_MAP: Record<number, string> = {
  1: "VaultError::AlreadyInitialized (#1)",
  2: "VaultError::NotInitialized (#2)",
  3: "VaultError::VaultPaused (#3)",
  4: "VaultError::UnauthorizedCfo (#4)",
  5: "VaultError::InvalidPasskeySignature (#5)",
  6: "VaultError::PolicyNotFound (#6)",
  7: "VaultError::PolicyInactive (#7)",
  8: "VaultError::UnauthorizedSpender (#8)",
  9: "VaultError::MerchantNotWhitelisted (#9)",
  10: "VaultError::SingleTxLimitExceeded (#10)",
  11: "VaultError::DailyLimitExceeded (#11)",
  12: "VaultError::InvalidAmount (#12)",
};

/**
 * Extracts and maps contract error codes from Soroban Host diagnostics / simulation error.
 */
export function parseSorobanContractError(
  err: unknown
): { code: number; name: string; raw: string } | null {
  const str =
    typeof err === "string"
      ? err
      : err && typeof err === "object"
      ? (err as any).error || (err as any).message || JSON.stringify(err)
      : "";

  // Pattern: Error(Contract, #9) or Error(Contract, 9)
  const match = str.match(/Error\s*\(\s*Contract\s*,\s*#?(\d+)\s*\)/i);
  if (match && match[1]) {
    const code = parseInt(match[1], 10);
    const name = VAULT_ERROR_MAP[code] || `VaultError::Unknown (#${code})`;
    return { code, name, raw: str };
  }

  return null;
}
