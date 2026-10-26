import manifest from "@/lib/contracts/manifest.json";

export interface DemoStep {
  step: string;
  title: string;
  event: string;
  desc: string;
  durationMs: number;
  txHash: string;
  status: string;
  statusVariant: "ok" | "pending" | "error";
}

export interface DemoScenario {
  id: string;
  label: string;
  title: string;
  eurcDebited: number;
  usdcAmount: number;
  rate: number;
  merchant: string;
  steps: DemoStep[];
}

export interface DemoCard {
  id: string;
  label: string;
  code: string;
  subsidiary: string;
  dailyLimitUsdc: number;
  spentUsdc: number;
  allowedMerchant: string;
  cardPan: string;
  expiry: string;
  role: "HUMAN_DEPARTMENT" | "AUTONOMOUS_AGENT";
}

export interface DemoFleetItem {
  id: string;
  city: string;
  name: string;
  localTime: string;
  eurcBalance: string;
  usdcBalance: string;
  status: "ACTIVE" | "SETTLED" | "NOMINAL";
  vaultAddress: string;
}

export const DEMO_CONFIG = {
  // Protocol & Network
  network: "Stellar Testnet",
  protocol: "Protocol 29",
  cfoStatus: "Signed · P-256 · a3f9…c21",

  // Contracts (Dynamic resolution)
  contracts: {
    vaultContractId:
      process.env.NEXT_PUBLIC_PORTUS_VAULT_CONTRACT_ID ||
      manifest.treasuryVaultId ||
      "CD4S3FUVKPPHQMOI36AWTPGBYNWYRVHFNMRPATEIHENURQK77A5YTMWU",
    vaultFactoryId:
      manifest.vaultFactoryId ||
      "CC2Q2JLSIHMIXS4VQMNG57FXO4LPUQPSK2Z6CQAQXH5AKL6Y5NX4TBCF",
    eurcSacId:
      manifest.eurcSacId ||
      "CBESXK3KRJKX7FI6HJQEY26KQ3ZYRFNDG3IICYOMGMJHLLFCCKZNV3DS",
    usdcSacId:
      manifest.usdcSacId ||
      "CCVE7CGVRI5T5S6GXSLRAVEYCA2XZIWHJJ7IVGTUVW6DOD2R34VDAX6K",
  },

  // Treasury Reserve
  reserve: {
    initialEurc: 50000.0,
    formattedEurc: "50,000.00",
    currency: "EURC",
    fxRate: 1.0862,
    formattedUsdc: "$54,310.00",
    usdcAmount: 54310.0,
    fxRateLabel: "EUR/USD 1.0862",
  },

  // Virtual Cards
  cards: {
    deptOps: {
      id: "DEPT-OPS",
      code: "PT-OPS-01",
      label: "Lisbon Cloud & Ops",
      subsidiary: "Portus Iberia S.A.",
      dailyLimitUsdc: 500.0,
      spentUsdc: 125.0,
      allowedMerchant: "AWS",
      cardPan: "•••• •••• •••• 4092",
      expiry: "12/28",
      role: "HUMAN_DEPARTMENT",
    } as DemoCard,
    agentFx: {
      id: "AGENT-FX",
      code: "AUTO-ROUTER-02",
      label: "Autonomous FX Agent",
      subsidiary: "Automated Micro-router",
      dailyLimitUsdc: 10.0,
      spentUsdc: 2.0,
      allowedMerchant: "x402 APIs",
      cardPan: "•••• •••• •••• 8104",
      expiry: "12/28",
      role: "AUTONOMOUS_AGENT",
    } as DemoCard,
  },

  // Execution Scenarios
  scenarios: [
    {
      id: "scenario-1",
      label: "Scenario 1: AWS Bill",
      title: "AWS Cloud Infrastructure Invoice",
      eurcDebited: 115.1,
      usdcAmount: 125.0,
      rate: 1.0862,
      merchant: "aws",
      steps: [
        {
          step: "01",
          title: "Policy Check",
          event: "VAULT_POLICY_CHECK",
          desc: "DEPT-OPS daily cap verified ($125 of $500).",
          durationMs: 42,
          txHash:
            "9445b620a13460bba2d37d681a71fd96a67882eb291de22652d184e831ea61df",
          status: "APPROVED",
          statusVariant: "ok",
        },
        {
          step: "02",
          title: "SDEX Path Payment",
          event: "SDEX_PATH_PAYMENT",
          desc: "115.10 EURC swapped for 125.00 USDC at 1.0862.",
          durationMs: 142,
          txHash:
            "e4efb2affd6aa9a8e3febe0165560f945c7df1fe3641d79e9bcf47597991f65d",
          status: "SWAPPED",
          statusVariant: "ok",
        },
        {
          step: "03",
          title: "Vendor Payout",
          event: "USDC_TRANSFER_AWS",
          desc: "125.00 USDC delivered to AWS merchant account.",
          durationMs: 88,
          txHash:
            "8f2ae05d7612c4b85c192089476b7724aef603d1591f28b760e5cb1594919c41",
          status: "200 OK · SETTLED",
          statusVariant: "ok",
        },
      ],
    },
    {
      id: "scenario-2",
      label: "Scenario 2: x402 API",
      title: "Autonomous x402 Micropayment",
      eurcDebited: 1.84,
      usdcAmount: 2.0,
      rate: 1.0862,
      merchant: "x402 Facilitator",
      steps: [
        {
          step: "01",
          title: "HTTP 402 Challenge",
          event: "X402_CHALLENGE",
          desc: "Gateway returns 402 with Stellar SAC payment spec.",
          durationMs: 18,
          txHash:
            "17a85d614c50b51c2d5b524811bf7c27d990de762f1b947773aa511574813ba1",
          status: "HTTP 402",
          statusVariant: "pending",
        },
        {
          step: "02",
          title: "JIT Spend Authorization",
          event: "AGENT_POLICY_JIT",
          desc: "AGENT-FX authorizes $2.00 USDC autonomous spend.",
          durationMs: 36,
          txHash:
            "27a85d614c50b51c2d5b524811bf7c27d990de762f1b947773aa511574813ba2",
          status: "AUTHORIZED",
          statusVariant: "ok",
        },
        {
          step: "03",
          title: "Facilitator Settlement",
          event: "X402_SETTLED_200",
          desc: "1.84 EURC debited, $2.00 USDC settled. Data unsealed.",
          durationMs: 94,
          txHash:
            "97a85d614c50b51c2d5b524811bf7c27d990de762f1b947773aa511574813ba0",
          status: "200 OK · SETTLED",
          statusVariant: "ok",
        },
      ],
    },
    {
      id: "scenario-3",
      label: "Scenario 3: Blocked Merchant",
      title: "Unauthorized Spend Revert",
      eurcDebited: 0.0,
      usdcAmount: 50.0,
      rate: 1.0862,
      merchant: "unauthorized-vendor.io",
      steps: [
        {
          step: "01",
          title: "Payment Intercept",
          event: "UNAUTHORIZED_OUTFLOW",
          desc: "Disbursement request to non-whitelisted merchant.",
          durationMs: 24,
          txHash:
            "3a85d614c50b51c2d5b524811bf7c27d990de762f1b947773aa511574813ba3",
          status: "INTERCEPTED",
          statusVariant: "pending",
        },
        {
          step: "02",
          title: "Soroban Policy Check",
          event: "POLICY_RESTRICTION",
          desc: "Recipient not found in DEPT-OPS AWS-only whitelist.",
          durationMs: 19,
          txHash:
            "4a85d614c50b51c2d5b524811bf7c27d990de762f1b947773aa511574813ba4",
          status: "CHECK FAILED",
          statusVariant: "error",
        },
        {
          step: "03",
          title: "Contract Revert",
          event: "SOROBAN_REVERT",
          desc: "Execution reverted with #9 MerchantNotWhitelisted.",
          durationMs: 12,
          txHash:
            "5a85d614c50b51c2d5b524811bf7c27d990de762f1b947773aa511574813ba5",
          status: "REVERT #9",
          statusVariant: "error",
        },
      ],
    },
  ] as DemoScenario[],

  // Subsidiary Fleet
  fleet: [
    {
      id: "LISBON_HQ",
      city: "Lisbon HQ",
      name: "Portus Iberia S.A.",
      localTime: "17:42 WET",
      eurcBalance: "32,450.00 EURC",
      usdcBalance: "$35,247.19 USDC",
      status: "ACTIVE",
      vaultAddress: "CDDKREHRD473MCXFCZXUXT2YXOZYLRWMGVTHK46WM3DTM2ONZLZXO7CW",
    },
    {
      id: "FRANKFURT",
      city: "Frankfurt Desk",
      name: "Portus DACH GmbH",
      localTime: "18:42 CET",
      eurcBalance: "12,550.00 EURC",
      usdcBalance: "$13,631.81 USDC",
      status: "ACTIVE",
      vaultAddress: "CA2KQKNSM33IVXEUBINM6NQ3GSJ3ASD6LSJL7DZASL5CB7KABNKJHPFB",
    },
    {
      id: "SINGAPORE",
      city: "Singapore Desk",
      name: "Portus APAC Pte. Ltd.",
      localTime: "01:42 SGT",
      eurcBalance: "5,000.00 EURC",
      usdcBalance: "$5,431.00 USDC",
      status: "ACTIVE",
      vaultAddress: "CBEZH4KWBXOXEMB4H77QJSLKAISDR4AWL6AZK5RVPUVD7YNCGVUI47W6",
    },
  ] as DemoFleetItem[],
};
