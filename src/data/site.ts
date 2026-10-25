import type {
  TreasuryStateSnapshot,
  SpendPolicy,
  SubsidiaryVaultRecord,
  SettlementReceipt,
  X402WireStep,
} from "@/types/treasury";

export const site = {
  name: "Portus",
  tagline: "Institutional Multi-Currency Treasury on Stellar",
  role: "Lisbon Maritime Clearinghouse Protocol",
  description:
    "Hold Euro reserves. Settle Dollar operations atomically via Soroban CAP-0086 spend policies, Native Stellar DEX, and x402 v2 micropayment channels.",
  url: "https://portus.stellar.org",
  network: "Stellar Testnet (Protocol 29)",
  hackathon: "HackMeridian 2026 · Lisbon, Portugal · Genesis Path",
  authors: "Portus Engineering",
};

export const INITIAL_POLICIES: SpendPolicy[] = [
  {
    policyId: "DEPT_OPS",
    label: "Lisbon Cloud & Ops Card",
    role: "HUMAN_DEPARTMENT",
    spenderAddress: "GAEWLFKZOO7SI46XXETJ4TSVKPHODNBFSZOPDP2OZTDYA4P6Y7RTR5BA",
    dailyLimitUsdc: "500.0000000",
    spentTodayUsdc: "25.0000000",
    maxSingleTxUsdc: "250.0000000",
    costCenter: "PT-OPS-01",
    periodResetTimestamp: 1792974300,
    allowedMerchants: [
      "GDBRUBLKMK2IARDO2BOICJL4Z7ZI3BWXOGRVCEVE6NXTNABPYJCKLCVH",
    ],
    isActive: true,
  },
  {
    policyId: "AGENT_FX",
    label: "Autonomous FX Treasury Agent",
    role: "AUTONOMOUS_AGENT",
    spenderAddress: "GB6KLHIUD2T7EYDA5HBTPBVHN44IQMCYSWBIYZPGSQ3TUEZ5SYQXZFWO",
    dailyLimitUsdc: "50.0000000",
    spentTodayUsdc: "2.0000000",
    maxSingleTxUsdc: "10.0000000",
    // costCenter intentionally omitted to demonstrate CAP-0086 sparse Option<T> structs on-chain
    periodResetTimestamp: 1792974300,
    allowedMerchants: [
      "GDBRUBLKMK2IARDO2BOICJL4Z7ZI3BWXOGRVCEVE6NXTNABPYJCKLCVH",
    ],
    isActive: true,
  },
];

export const INITIAL_FLEET: SubsidiaryVaultRecord[] = [
  {
    subsidiaryCode: "LISBON_HQ",
    name: "Portus Iberia S.A.",
    jurisdiction: "Lisbon, PT",
    vaultAddress: "CDDKREHRD473MCXFCZXUXT2YXOZYLRWMGVTHK46WM3DTM2ONZLZXO7CW",
    executableTag: "v1_vault",
    wasmHash: "55be053e80de94bd6935d66b36e26f0bc2543e752a0e9b06244e355519c80674",
    deployedLedger: 5381488,
  },
  {
    subsidiaryCode: "FRANKFURT",
    name: "Portus DACH GmbH",
    jurisdiction: "Frankfurt, DE",
    vaultAddress: "CA2KQKNSM33IVXEUBINM6NQ3GSJ3ASD6LSJL7DZASL5CB7KABNKJHPFB",
    executableTag: "v1_vault",
    wasmHash: "55be053e80de94bd6935d66b36e26f0bc2543e752a0e9b06244e355519c80674",
    deployedLedger: 5381489,
  },
];

export const REFERENCE_X402_TRACE: X402WireStep[] = [
  {
    step: 1,
    direction: "SERVER_TO_CLIENT",
    title: "Gateway returns HTTP 402 Payment Required with Stellar SAC specs",
    httpStatus: 402,
    headers: {
      "payment-required":
        "eyJ4NDAyVmVyc2lvbiI6MiwiZXJyb3IiOiJQYXltZW50IHJlcXVpcmVkIiwiYWNjZXB0cyI6W3sic2NoZW1lIjoiZXhhY3QiLCJuZXR3b3JrIjoic3RlbGxhcjp0ZXN0bmV0IiwiYW1vdW50IjoiMjAwMDAwMDAifV19",
      "content-type": "application/json",
    },
    decodedPayload: {
      x402Version: 2,
      scheme: "exact",
      network: "stellar:testnet",
      amount: "20000000",
      asset: "CCVE7CGVRI5T5S6GXSLRAVEYCA2XZIWHJJ7IVGTUVW6DOD2R34VDAX6K",
      payTo: "GDBRUBLKMK2IARDO2BOICJL4Z7ZI3BWXOGRVCEVE6NXTNABPYJCKLCVH",
      areFeesSponsored: true,
    },
    durationMs: 2,
  },
  {
    step: 2,
    direction: "VAULT_ONCHAIN",
    title: "Soroban Vault evaluates spend policy & releases EURC atomically",
    decodedPayload: {
      policyId: "AGENT_FX",
      role: "AUTONOMOUS_AGENT",
      spenderAddress: "GB6KLHIUD2T7EYDA5HBTPBVHN44IQMCYSWBIYZPGSQ3TUEZ5SYQXZFWO",
      authorizedAmountUsdc: "2.0000000",
      status: "APPROVED_WITHIN_DAILY_CAP",
    },
    txHash: "9445b620a13460bba2d37d681a71fd96a67882eb291de22652d184e831ea61df",
    durationMs: 4674,
  },
  {
    step: 3,
    direction: "SDEX_FX",
    title: "Native SDEX executes pathPaymentStrictReceive (1.8450180 EURC -> 2.0000 USDC)",
    decodedPayload: {
      sourceAsset: "EURC (CBESXK3K...SAC)",
      destAsset: "USDC (CCVE7CGV...SAC)",
      sourceAmountDebited: "1.8450180",
      destAmountDelivered: "2.0000000",
      clearingRate: "1.084000",
    },
    txHash: "e4efb2affd6aa9a8e3febe0165560f945c7df1fe3641d79e9bcf47597991f65d",
    durationMs: 4674,
  },
  {
    step: 4,
    direction: "SERVER_TO_CLIENT",
    title: "x402 Facilitator settles signed USDC transfer on Testnet (200 OK)",
    httpStatus: 200,
    headers: {
      "payment-response":
        "eyJzdWNjZXNzIjp0cnVlLCJ0cmFuc2FjdGlvbiI6Ijk3YTg1ZDYxNGM1MGI1MWMyZDViNTI0ODExYmY3YzI3ZDk5MGRlNzYyZjFiOTQ3NzczYWE1MTE1NzQ4MTNiYTAiLCJuZXR3b3JrIjoic3RlbGxhcjp0ZXN0bmV0In0=",
      "content-type": "application/json;charset=utf-8",
    },
    decodedPayload: {
      success: true,
      transaction: "97a85d614c50b51c2d5b524811bf7c27d990de762f1b947773aa511574813ba0",
      network: "stellar:testnet",
      payer: "GB6KLHIUD2T7EYDA5HBTPBVHN44IQMCYSWBIYZPGSQ3TUEZ5SYQXZFWO",
    },
    txHash: "97a85d614c50b51c2d5b524811bf7c27d990de762f1b947773aa511574813ba0",
    durationMs: 5680,
  },
];

export const REFERENCE_INTELLIGENCE_PAYLOAD = {
  feed: "Portus Clearinghouse Macro FX Desk",
  pair: "EURC/USDC",
  ecbReferenceRate: "1.0847",
  sdexExecutableAsk: "1.0850",
  spreadBps: 2.8,
  recommendedAction: "EXECUTE_JIT_PATH_PAYMENT",
  confidence: 0.994,
  timestamp: "2026-10-25T12:25:39.532Z",
};

export const INITIAL_AUDIT_TRAIL: SettlementReceipt[] = [
  {
    id: "RCPT-2026-1025-X402",
    timestamp: "2026-10-25T12:25:43.023Z",
    scenario: "AGENT_X402_SETTLEMENT",
    status: "SETTLED",
    policyId: "AGENT_FX",
    spenderLabel: "Autonomous FX Treasury Agent",
    merchantAddress: "GDBRUBLKMK2IARDO2BOICJL4Z7ZI3BWXOGRVCEVE6NXTNABPYJCKLCVH",
    sorobanPolicyTxHash: "9445b620a13460bba2d37d681a71fd96a67882eb291de22652d184e831ea61df",
    sdexPathPaymentTxHash: "e4efb2affd6aa9a8e3febe0165560f945c7df1fe3641d79e9bcf47597991f65d",
    x402SettlementTxHash: "97a85d614c50b51c2d5b524811bf7c27d990de762f1b947773aa511574813ba0",
    eurcDebited: "1.8450180",
    usdcDelivered: "2.0000000",
    effectiveFxRate: "1.084000",
    ledgerSequence: 5381510,
    explorerUrl: "https://stellar.expert/explorer/testnet/tx/97a85d614c50b51c2d5b524811bf7c27d990de762f1b947773aa511574813ba0",
    x402WireTrace: REFERENCE_X402_TRACE,
    intelligencePayload: REFERENCE_INTELLIGENCE_PAYLOAD,
  },
  {
    id: "RCPT-2026-1025-DEPT",
    timestamp: "2026-10-25T12:25:27.330Z",
    scenario: "DEPARTMENT_FX_PAYOUT",
    status: "SETTLED",
    policyId: "DEPT_OPS",
    spenderLabel: "Lisbon Cloud & Ops Card",
    merchantAddress: "GDBRUBLKMK2IARDO2BOICJL4Z7ZI3BWXOGRVCEVE6NXTNABPYJCKLCVH",
    sorobanPolicyTxHash: "6199c56400cf74f8972004cea379046039dcda712d8ec2460dee33c55472ad04",
    sdexPathPaymentTxHash: "5f448c0bf66af809b73a1ac49cd168831e36b1f92260ed6593b53672df4d7e38",
    eurcDebited: "23.0627250",
    usdcDelivered: "25.0000000",
    effectiveFxRate: "1.084000",
    ledgerSequence: 5381508,
    explorerUrl: "https://stellar.expert/explorer/testnet/tx/5f448c0bf66af809b73a1ac49cd168831e36b1f92260ed6593b53672df4d7e38",
  },
];

export const INITIAL_TREASURY_SNAPSHOT: TreasuryStateSnapshot = {
  network: "testnet",
  protocolVersion: 29,
  latestLedger: 5381510,
  vaultContractId: "CD4S3FUVKPPHQMOI36AWTPGBYNWYRVHFNMRPATEIHENURQK77A5YTMWU",
  factoryContractId: "CC2Q2JLSIHMIXS4VQMNG57FXO4LPUQPSK2Z6CQAQXH5AKL6Y5NX4TBCF",
  eurcSacId: "CBESXK3KRJKX7FI6HJQEY26KQ3ZYRFNDG3IICYOMGMJHLLFCCKZNV3DS",
  usdcSacId: "CCVE7CGVRI5T5S6GXSLRAVEYCA2XZIWHJJ7IVGTUVW6DOD2R34VDAX6K",
  issuerPublicKey: "GDISHSSKOXL3JY2L5NGZZMMOC7LPUTXJHEOQ64BH6JIVNFWC7ITUIYRU",
  paused: false,
  cfoPasskeyRegistered: true,
  cfoPublicKey: "GD2P62GWWAIG2I3OBQNG5PD3TZPJPTJHAE3MH47B4MAZPJSDYPZY3SJO",
  balances: {
    vaultEurc: "49974.7186610",
    vaultUsdc: "0.0000000",
    vendorUsdc: "27.0000000",
    agentBufferUsdc: "0.0000000",
    sdexEurcDepth: "2000000.0000000",
    sdexUsdcDepth: "1999973.0000000",
    indicativeEurUsdRate: "1.0840003",
  },
  policies: INITIAL_POLICIES,
  fleet: INITIAL_FLEET,
  recentAuditTrail: INITIAL_AUDIT_TRAIL,
};

export const ALIGNMENT_TRACKS = {
  unlocked: {
    title: "Stellar Unlocked Track",
    subtitle: "Native Stellar protocol primitives executed in harmony with Soroban",
    items: [
      {
        feature: "Native SDEX Atomic Conversion",
        primitive: "Operation.pathPaymentStrictReceive",
        fileReference: "src/lib/stellar/fx-settlement.ts",
        onChainProof: "Atomically swaps EURC into exact USDC across the protocol orderbook without holding idle dollar float.",
      },
      {
        feature: "Classic Assets + SAC Interoperability",
        primitive: "SEP-41 Contract Token Bridge",
        fileReference: "contracts/treasury_vault/src/lib.rs",
        onChainProof: "Bridges EURC and USDC directly between classic Stellar trustlines and Soroban smart contract custody.",
      },
      {
        feature: "CAP-0085 Shared Executable Fleet",
        primitive: "Shared Wasm Executable Registry",
        fileReference: "contracts/vault_factory/src/lib.rs",
        onChainProof: "Regional European subsidiaries deploy lightweight contract instances referencing a single audited Wasm hash.",
      },
      {
        feature: "CAP-0086 Sparse Policy Structs",
        primitive: "Option<T> Sparse Map Unpacking",
        fileReference: "src/lib/stellar/config.ts",
        onChainProof: "Discretionary policy attributes (maxSingleTx, costCenter) omit absent keys on-wire and unpack via sparse_map_unpack_to_slice.",
      },
    ],
  },
  composed: {
    title: "Stellar Composed Track",
    subtitle: "Institutional ecosystem composability with modern cryptographic primitives",
    items: [
      {
        feature: "Hardware WebAuthn CFO Passkeys",
        primitive: "secp256r1 P-256 Host Verification",
        fileReference: "src/lib/stellar/webauthn-passkey.ts",
        onChainProof: "Cryptographic CFO authorization via Soroban secp256r1_verify with low-S normalized P-256 signatures.",
      },
      {
        feature: "Autonomous Agent Wallets",
        primitive: "Bounded Sub-Account Spend Policy",
        fileReference: "src/lib/x402/agent-buyer.ts",
        onChainProof: "Autonomous software agents pull exact JIT liquidity bound by strict on-chain daily and per-transaction caps.",
      },
      {
        feature: "OpenZeppelin Pausable & Ownable",
        primitive: "OpenZeppelin Soroban v0.8.0",
        fileReference: "contracts/treasury_vault/src/lib.rs",
        onChainProof: "Audited institutional access and emergency circuit-breaker primitives from stellar-access & stellar-contract-utils.",
      },
      {
        feature: "x402 v2 HTTP Micropayment Channels",
        primitive: "@x402/stellar v2 Protocol",
        fileReference: "src/app/api/x402/fx-intelligence/route.ts",
        onChainProof: "Standardized HTTP 402 Payment Required negotiation settled on-chain via fee-sponsored Stellar SAC transfers.",
      },
    ],
  },
};

export const COMPARISON_TABLE = [
  {
    dimension: "Liquidity Efficiency",
    traditional: "Double prefunding: €1M Euro cash + $1.1M idle Dollar float trapped across foreign accounts.",
    portus: "100% single-currency Euro reserve. Dollars purchased JIT via Native SDEX at the moment of spend.",
  },
  {
    dimension: "Policy Enforcement",
    traditional: "Off-chain web server rules or centralized banking portals vulnerable to application compromise.",
    portus: "Deterministic Soroban VM execution. Unwhitelisted merchants or over-cap spends revert on-chain.",
  },
  {
    dimension: "Autonomous AI Agent Support",
    traditional: "Pre-funded corporate credit cards or shared API keys with unconstrained overdraft exposure.",
    portus: "Bounded x402 sub-allowance. Agent pulls exact micropayments with zero idle balance exposure.",
  },
  {
    dimension: "Multi-Entity Scaling",
    traditional: "Deploying 50 duplicate smart contracts across subsidiaries multiplies Wasm storage rent.",
    portus: "VaultFactory references a single audited Wasm hash across all European regional entities.",
  },
  {
    dimension: "CFO Governance",
    traditional: "Centralized password and SMS 2FA vulnerable to phishing and credential replay.",
    portus: "Hardware secp256r1 WebAuthn Passkey with on-chain P-256 cryptographic signature verification.",
  },
];

export const ROADMAP_TRANCHES = [
  {
    tranche: "Tranche 1 · HackMeridian 2026 MVP",
    milestone: "Stellar Protocol 29 Core Engine & Live Testnet Cockpit",
    deliverables:
      "EURC Soroban Vault, Native SDEX pathPaymentStrictReceive, Fleet Factory, CAP-0086 Sparse Policies, x402 v2 HTTP settlement, and CFO Passkeys.",
    status: "Completed & Live on Testnet",
  },
  {
    tranche: "Tranche 2 · SCF Build Award Phase 1",
    milestone: "Lisbon & European Regulated Anchor Rails",
    deliverables:
      "Direct SEP-24 and SEP-31 integration with licensed European SEPA anchors (MYKOBO, Circle EURC minting) and IBAN virtual accounts.",
    status: "Q4 2026 Target",
  },
  {
    tranche: "Tranche 3 · SCF Build Award Phase 2",
    milestone: "Stellar Private Payments & Confidential Payroll",
    deliverables:
      "Zero-knowledge shielded balance proofs for executive payroll and confidential vendor supplier settlement.",
    status: "Q1 2027 Target",
  },
  {
    tranche: "Tranche 4 · Enterprise Production",
    milestone: "ERP & Treasury Management System Connectors",
    deliverables:
      "Bi-directional connectors for SAP S/4HANA, NetSuite, and Workday with automated ledger reconciliation.",
    status: "Q2 2027 Target",
  },
];
