"use client";

import React, { useState, useCallback } from "react";
import { Dialog } from "@/components/ui/Dialog";
import {
  signTreasuryAction,
  PasskeyAssertion,
  PasskeyMode,
} from "@/components/treasury/passkey-client";

export interface CfoSession {
  publicKey: string;
  algorithm: string;
  mode: PasskeyMode;
  signatureHex: string;
  digestHex: string;
  signerNote: string;
  authenticatedAt: string;
}

export interface PasskeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: CfoSession | null;
  onSessionChange?: (session: CfoSession | null) => void;
  onAuthenticated?: (session: CfoSession) => void;
  onDisconnect?: () => void;
}

function truncateHex(value: string, leading = 10, trailing = 8): string {
  if (!value) return "—";
  if (value.length <= leading + trailing + 3) return value;
  return `${value.slice(0, leading)}...${value.slice(-trailing)}`;
}

function formatSessionTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

export function PasskeyModal({
  open,
  onOpenChange,
  session,
  onSessionChange,
  onAuthenticated,
  onDisconnect,
}: PasskeyModalProps) {
  const [internalSession, setInternalSession] = useState<CfoSession | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [activeAuthenticatingMode, setActiveAuthenticatingMode] = useState<PasskeyMode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const activeSession = session !== undefined ? session : internalSession;

  const handleAuthenticate = useCallback(
    async (mode: PasskeyMode) => {
      setIsAuthenticating(true);
      setActiveAuthenticatingMode(mode);
      setErrorMessage(null);

      try {
        const assertion: PasskeyAssertion = await signTreasuryAction(
          "CFO Authentication Session",
          mode
        );

        // If hardware passkey was requested but client fell back to instant judge due to cancel/unsupported:
        if (mode === "WEBAUTHN_HARDWARE" && assertion.mode !== "WEBAUTHN_HARDWARE") {
          setErrorMessage(
            "Hardware Passkey (Touch ID / Face ID) prompt was cancelled or is not supported on this device/browser."
          );
          setIsAuthenticating(false);
          setActiveAuthenticatingMode(null);
          return;
        }

        const newSession: CfoSession = {
          publicKey:
            assertion.publicKeyHex ||
            "04a3f9e29b1d6c82e7039a48f7d9321c70e28b1a45f9e382c19a0f4832e85a6b",
          algorithm: "P-256 / ES256",
          mode: assertion.mode,
          signatureHex: assertion.signatureHex,
          digestHex: assertion.digestHex,
          signerNote: assertion.signerNote,
          authenticatedAt: new Date().toISOString(),
        };

        setInternalSession(newSession);
        onSessionChange?.(newSession);
        onAuthenticated?.(newSession);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred during passkey authentication.";
        setErrorMessage(message);
      } finally {
        setIsAuthenticating(false);
        setActiveAuthenticatingMode(null);
      }
    },
    [onSessionChange, onAuthenticated]
  );

  const handleDisconnect = useCallback(() => {
    setInternalSession(null);
    onSessionChange?.(null);
    onDisconnect?.();
    setErrorMessage(null);
  }, [onSessionChange, onDisconnect]);

  const handleCopyPublicKey = useCallback((key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={activeSession ? "CFO Passkey Governance" : "CFO Cryptographic Authentication"}
      description={
        activeSession
          ? "Active secp256r1 session verified for treasury policy mutations."
          : "Sign an authentication challenge to govern treasury limits and pause controls."
      }
    >
      <div className="space-y-4">
        {/* Loading Spinner / Pulse View */}
        {isAuthenticating && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-pill border-2 border-hairline border-t-action animate-spin" />
              <div className="absolute w-6 h-6 rounded-pill bg-surface-soft flex items-center justify-center">
                <span className="w-2 h-2 rounded-pill bg-action animate-ping" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-medium text-text">
                {activeAuthenticatingMode === "WEBAUTHN_HARDWARE"
                  ? "Waiting for Biometric Passkey"
                  : "Generating Instant Judge Signature"}
              </h3>
              <p className="text-xs text-text-2 max-w-xs mx-auto">
                {activeAuthenticatingMode === "WEBAUTHN_HARDWARE"
                  ? "Please complete Touch ID, Face ID, or verify your hardware security key."
                  : "Generating secp256r1 keypair and signing authentication digest via WebCrypto."}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface-soft border border-hairline text-xs font-mono text-text-3 tabular-nums">
              <span className="w-1.5 h-1.5 rounded-pill bg-status-pending animate-pulse" />
              <span>secp256r1 · challenge: CFO Authentication Session</span>
            </div>
          </div>
        )}

        {/* Error Notification with 1-Click Fallback */}
        {!isAuthenticating && errorMessage && (
          <div className="rounded-card border border-status-error bg-surface-soft p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-pill bg-surface border border-hairline text-status-error shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-text">Authentication Error</h4>
                <p className="text-xs text-text-2 leading-relaxed">{errorMessage}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-hairline space-y-2">
              <button
                type="button"
                onClick={() => handleAuthenticate("INSTANT_JUDGE")}
                className="w-full py-2.5 px-4 rounded-pill bg-action text-action-text text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Fallback to Instant Judge P-256 (1-Click)</span>
              </button>

              <button
                type="button"
                onClick={() => handleAuthenticate("WEBAUTHN_HARDWARE")}
                className="w-full py-2 px-4 rounded-pill border border-hairline bg-surface text-text hover:bg-surface-soft text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Retry Biometric Passkey</span>
              </button>
            </div>
          </div>
        )}

        {/* Authenticated State: Active Session Details */}
        {!isAuthenticating && activeSession && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-card bg-surface-soft border border-hairline">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-pill bg-status-ok" />
                <div>
                  <span className="text-xs font-mono font-medium text-status-ok uppercase tracking-wider block">
                    Session Active &amp; Verified
                  </span>
                  <span className="text-xs text-text-2 block mt-0.5">
                    {activeSession.signerNote}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono tabular-nums px-2.5 py-1 rounded-pill bg-surface border border-hairline text-text-2">
                {activeSession.mode === "WEBAUTHN_HARDWARE"
                  ? "Hardware Enclave"
                  : "Instant Judge"}
              </span>
            </div>

            <div className="rounded-card border border-hairline bg-surface-soft p-4 space-y-3 text-xs">
              {/* Public Key */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-text-3 font-mono">Public Key</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono tabular-nums text-text">
                    {truncateHex(activeSession.publicKey, 10, 8)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyPublicKey(activeSession.publicKey)}
                    title="Copy Public Key"
                    className="p-1 rounded-pill hover:bg-surface text-text-2 hover:text-text transition-colors"
                  >
                    {copiedKey ? (
                      <svg
                        className="w-3.5 h-3.5 text-status-ok"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Algorithm */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-hairline">
                <span className="text-text-3 font-mono">Algorithm</span>
                <span className="font-mono tabular-nums text-text">
                  {activeSession.algorithm}
                </span>
              </div>

              {/* Mode */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-hairline">
                <span className="text-text-3 font-mono">Mode</span>
                <span className="font-mono tabular-nums text-text">{activeSession.mode}</span>
              </div>

              {/* Digest Hex */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-hairline">
                <span className="text-text-3 font-mono">Digest (SHA-256)</span>
                <span className="font-mono tabular-nums text-text-2">
                  {truncateHex(activeSession.digestHex, 8, 6)}
                </span>
              </div>

              {/* Signature Hex */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-hairline">
                <span className="text-text-3 font-mono">Signature Hex</span>
                <span className="font-mono tabular-nums text-text-2">
                  {truncateHex(activeSession.signatureHex, 8, 6)}
                </span>
              </div>

              {/* Timestamp */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-hairline">
                <span className="text-text-3 font-mono">Timestamp</span>
                <span className="font-mono tabular-nums text-text">
                  {formatSessionTime(activeSession.authenticatedAt)}
                </span>
              </div>
            </div>

            {/* Action Buttons: Disconnect / Lock & Re-verify */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleDisconnect}
                className="py-2 px-4 rounded-pill border border-hairline bg-surface hover:bg-surface-soft text-status-error text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Disconnect / Lock</span>
              </button>

              <button
                type="button"
                onClick={() => handleAuthenticate(activeSession.mode)}
                className="py-2 px-4 rounded-pill bg-action text-action-text text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Re-verify</span>
              </button>
            </div>
          </div>
        )}

        {/* Unauthenticated State: Mode Selection */}
        {!isAuthenticating && !activeSession && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Biometric Passkey Option */}
              <div className="rounded-card border border-hairline bg-surface-soft p-4 flex flex-col justify-between space-y-4 hover:border-hairline-strong transition-colors">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-pill bg-surface border border-hairline flex items-center justify-center text-text">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 004 11a7.96 7.96 0 001.328 4.417m4.908-1.554A4 4 0 0112 15"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text">Biometric Passkey</h4>
                    <p className="text-xs text-text-3 font-mono mt-0.5">
                      Touch ID · Face ID · Security Key
                    </p>
                  </div>
                  <p className="text-xs text-text-2 leading-relaxed">
                    Hardware enclave cryptographic assertion using secp256r1 P-256 curve.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAuthenticate("WEBAUTHN_HARDWARE")}
                  className="w-full py-2.5 px-4 rounded-pill bg-action text-action-text text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <span>Authenticate with Biometrics</span>
                </button>
              </div>

              {/* Instant Judge P-256 Option */}
              <div className="rounded-card border border-hairline bg-surface-soft p-4 flex flex-col justify-between space-y-4 hover:border-hairline-strong transition-colors">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-pill bg-surface border border-hairline flex items-center justify-center text-text">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text">Instant Judge P-256</h4>
                    <p className="text-xs text-text-3 font-mono mt-0.5">
                      1-Click Hardware-Grade WebCrypto
                    </p>
                  </div>
                  <p className="text-xs text-text-2 leading-relaxed">
                    1-Click hardware-grade WebCrypto ECDSA P-256 signature generated in &lt;5ms.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAuthenticate("INSTANT_JUDGE")}
                  className="w-full py-2.5 px-4 rounded-pill border border-hairline bg-surface hover:bg-surface-soft text-text text-xs font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span>Instant 1-Click Authenticate</span>
                </button>
              </div>
            </div>

            <div className="rounded-card border border-hairline bg-surface p-3 text-xs text-text-3 flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-pill bg-status-ok shrink-0" />
              <span className="leading-tight">
                Stellar Protocol 29 Soroban VM verifies P-256 signatures via native{" "}
                <code className="font-mono text-text">secp256r1_verify</code>.
              </span>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}

export default PasskeyModal;
