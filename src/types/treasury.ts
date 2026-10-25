export type PolicyRole = "HUMAN_DEPARTMENT" | "AUTONOMOUS_AGENT";

export interface SpendPolicy {
  policyId: string;
  label: string;
  role: PolicyRole;
  spenderAddress: string;
  dailyLimitUsdc: string;     // 7-decimal formatted string e.g. "500.0000000"
  spentTodayUsdc: string;
  maxSingleTxUsdc?: string;   // CAP-0086 sparse optional field
  costCenter?: string;        // CAP-0086 sparse optional field
  periodResetTimestamp: number;
  allowedMerchants: string[]; // Classic G... or Contract C... addresses
  isActive: boolean;
}

export interface SubsidiaryVaultRecord {
  subsidiaryCode: string;
  name: string;
  jurisdiction: string;
  vaultAddress: string;
  executableTag: string;
  wasmHash: string;
  deployedLedger?: number;
}

export interface TreasuryStateSnapshot {
  network: "testnet";
  protocolVersion: number;
  latestLedger: number;
  vaultContractId: string;
  factoryContractId: string;
  eurcSacId: string;
  usdcSacId: string;
  issuerPublicKey: string;
  paused: boolean;
  cfoPasskeyRegistered: boolean;
  cfoPublicKey: string;
  balances: {
    vaultEurc: string;
    vaultUsdc: string;
    vendorUsdc: string;
    agentBufferUsdc: string;
    sdexEurcDepth: string;
    sdexUsdcDepth: string;
    indicativeEurUsdRate: string;
  };
  policies: SpendPolicy[];
  fleet: SubsidiaryVaultRecord[];
  recentAuditTrail: SettlementReceipt[];
}

export type DemoScenarioType =
  | "DEPARTMENT_FX_PAYOUT"
  | "AGENT_X402_SETTLEMENT"
  | "ROGUE_BREACH_BLOCKED";

export interface X402WireStep {
  step: number;
  direction: "CLIENT_TO_SERVER" | "SERVER_TO_CLIENT" | "VAULT_ONCHAIN" | "SDEX_FX";
  title: string;
  httpStatus?: number;
  headers?: Record<string, string>;
  decodedPayload?: Record<string, unknown>;
  txHash?: string;
  durationMs?: number;
}

export interface SettlementReceipt {
  id: string;
  timestamp: string;
  scenario: DemoScenarioType;
  status: "SETTLED" | "BLOCKED_BY_POLICY";
  policyId: string;
  spenderLabel: string;
  merchantAddress: string;
  sorobanPolicyTxHash?: string;
  sdexPathPaymentTxHash?: string;
  x402SettlementTxHash?: string;
  eurcDebited?: string;
  usdcDelivered?: string;
  effectiveFxRate?: string;
  errorCode?: string;
  errorDetail?: string;
  ledgerSequence?: number;
  explorerUrl?: string;
  x402WireTrace?: X402WireStep[];
  intelligencePayload?: Record<string, unknown>;
}

export interface ContractManifest {
  network: "testnet";
  rpcUrl: string;
  horizonUrl: string;
  networkPassphrase: string;
  protocolVersion: number;
  treasuryVaultId: string;
  vaultFactoryId: string;
  treasuryVaultWasmHash: string;
  eurcSacId: string;
  usdcSacId: string;
  eurcAssetCode: "EURC";
  usdcAssetCode: "USDC";
  issuerPublicKey: string;
  cfoAdminPublicKey: string;
  opsSpenderPublicKey: string;
  agentSpenderPublicKey: string;
  vendorRecipientPublicKey: string;
  x402FacilitatorPublicKey: string;
  subsidiaryVaults: SubsidiaryVaultRecord[];
  seededAt: string;
}
