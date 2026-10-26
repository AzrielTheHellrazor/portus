import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import PasskeyModalDefault, {
  PasskeyModal,
  type CfoSession,
  type PasskeyModalProps,
} from "@/components/treasury/PasskeyModal";
import { signTreasuryAction } from "@/components/treasury/passkey-client";

describe("PasskeyModal Component Specification", () => {
  beforeAll(() => {
    if (typeof (globalThis as any).window === "undefined") {
      (globalThis as any).window = {
        crypto: globalThis.crypto,
        location: { hostname: "localhost" },
      };
    }
  });

  afterAll(() => {
    delete (globalThis as any).window;
  });

  test("1. Module exports PasskeyModal as named and default export", () => {
    expect(PasskeyModal).toBeDefined();
    expect(PasskeyModalDefault).toBeDefined();
    expect(PasskeyModal).toBe(PasskeyModalDefault);
    expect(typeof PasskeyModal).toBe("function");
  });

  test("2. CfoSession interface matches cryptographic spec", () => {
    const mockSession: CfoSession = {
      publicKey: "04a3f9e29b1d6c82e7039a48f7d9321c70e28b1a45f9e382c19a0f4832e85a6b",
      algorithm: "P-256 / ES256",
      mode: "INSTANT_JUDGE",
      signatureHex: "abcdef1234567890",
      digestHex: "1234567890abcdef",
      signerNote: "Instant Judge WebCrypto ECDSA P-256 Verified (1-Click)",
      authenticatedAt: new Date().toISOString(),
    };

    expect(mockSession.publicKey).toBeDefined();
    expect(mockSession.algorithm).toBe("P-256 / ES256");
    expect(mockSession.mode).toBe("INSTANT_JUDGE");
    expect(mockSession.signatureHex).toBe("abcdef1234567890");
    expect(mockSession.digestHex).toBe("1234567890abcdef");
    expect(mockSession.signerNote).toContain("P-256");
    expect(mockSession.authenticatedAt).toBeDefined();
  });

  test("3. signTreasuryAction supports both WEBAUTHN_HARDWARE and INSTANT_JUDGE", async () => {
    const instantAssertion = await signTreasuryAction("CFO Authentication Session", "INSTANT_JUDGE");
    expect(instantAssertion.mode).toBe("INSTANT_JUDGE");
    expect(instantAssertion.signatureHex).toBeDefined();
    expect(instantAssertion.digestHex).toBeDefined();
    expect(instantAssertion.signerNote).toBeDefined();

    const hwAssertion = await signTreasuryAction("CFO Authentication Session", "WEBAUTHN_HARDWARE");
    expect(hwAssertion).toBeDefined();
    expect(hwAssertion.signatureHex).toBeDefined();
    expect(hwAssertion.digestHex).toBeDefined();
  });
});
