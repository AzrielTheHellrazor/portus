import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Portus · Institutional Multi-Currency Treasury on Stellar";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          backgroundColor: "#F6F5F1",
          color: "#0C0F14",
          fontFamily: "system-ui, sans-serif",
          border: "12px solid #0B3B2C",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "10px",
                backgroundColor: "#0C0F14",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#C59A45",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              P
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "24px", fontWeight: "bold", letterSpacing: "-0.02em" }}>
                Portus
              </span>
              <span style={{ fontSize: "14px", color: "#4A5260", textTransform: "uppercase" }}>
                Lisbon Clearinghouse Protocol
              </span>
            </div>
          </div>
          <div
            style={{
              padding: "8px 16px",
              backgroundColor: "#0B3B2C",
              color: "#FFFFFF",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Stellar Protocol 29 · HackMeridian 2026
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: "950px" }}>
          <div style={{ fontSize: "16px", color: "#9A7029", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
            Genesis Path · Stellar Unlocked & Stellar Composed
          </div>
          <div
            style={{
              fontSize: "56px",
              fontWeight: "800",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#0C0F14",
              marginBottom: "20px",
            }}
          >
            Hold Euro Reserves. Settle Dollar Operations Atomically.
          </div>
          <div style={{ fontSize: "20px", color: "#4A5260", lineHeight: 1.5 }}>
            Soroban CAP-0086 spend policies, Native SDEX JIT path payments, x402 v2 HTTP micropayments, and secp256r1 Passkeys.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "24px",
            borderTop: "2px solid rgba(12,15,20,0.1)",
            fontSize: "14px",
            color: "#646D7C",
          }}
        >
          <span>EURC Soroban Vault · Circle USDC Settlement</span>
          <span>Lisbon, Portugal · HackMeridian 2026</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
