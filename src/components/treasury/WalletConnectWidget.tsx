"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isConnected,
  requestAccess,
  getAddress,
  getNetworkDetails,
  signTransaction,
  addToken,
} from "@stellar/freighter-api";
import {
  Horizon,
  TransactionBuilder,
  Operation,
  Networks,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import {
  stellarExpertTxUrl,
  stellarExpertAccountUrl,
  stellarLabTxUrl,
} from "./stellar-lab";

interface WalletConnectWidgetProps {
  vaultContractId?: string;
  eurcSacId?: string;
  usdcSacId?: string;
}

const DEFAULT_VAULT_ID =
  "CD4S3FUVKPPHQMOI36AWTPGBYNWYRVHFNMRPATEIHENURQK77A5YTMWU";
const DEFAULT_EURC_SAC =
  "CBESXK3KRJKX7FI6HJQEY26KQ3ZYRFNDG3IICYOMGMJHLLFCCKZNV3DS";
const DEFAULT_USDC_SAC =
  "CCVE7CGVRI5T5S6GXSLRAVEYCA2XZIWHJJ7IVGTUVW6DOD2R34VDAX6K";
const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";

export function WalletConnectWidget({
  vaultContractId = DEFAULT_VAULT_ID,
  eurcSacId = DEFAULT_EURC_SAC,
  usdcSacId = DEFAULT_USDC_SAC,
}: WalletConnectWidgetProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [isFreighterInstalled, setIsFreighterInstalled] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAttesting, setIsAttesting] = useState(false);
  const [attestationTxHash, setAttestationTxHash] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tokenStatus, setTokenStatus] = useState<Record<string, string>>({});
  const [balances, setBalances] = useState<{ xlm: string; eurc?: string; usdc?: string } | null>(null);

  // Check if Freighter extension is available
  const checkFreighterAvailability = useCallback(async () => {
    try {
      const res = await isConnected();
      const connected = typeof res === "object" && res !== null ? res.isConnected : Boolean(res);
      setIsFreighterInstalled(Boolean(connected));
      if (connected) {
        // Check if access was already granted
        const addrRes = await getAddress();
        if (addrRes && addrRes.address && !addrRes.error) {
          setAddress(addrRes.address);
          void fetchNetworkAndBalances(addrRes.address);
        }
      }
    } catch {
      setIsFreighterInstalled(false);
    }
  }, []);

  useEffect(() => {
    void checkFreighterAvailability();
  }, [checkFreighterAvailability]);

  // Fetch balances from Stellar Testnet Horizon
  const fetchNetworkAndBalances = async (userAddress: string) => {
    try {
      const netRes = await getNetworkDetails();
      if (netRes && !netRes.error) {
        setNetworkName(netRes.network || "TESTNET");
      }
    } catch {
      setNetworkName("TESTNET");
    }

    try {
      const server = new Horizon.Server(HORIZON_TESTNET);
      const acc = await server.loadAccount(userAddress);
      let xlm = "0.0000000";
      let eurc: string | undefined;
      let usdc: string | undefined;

      for (const b of acc.balances) {
        if (b.asset_type === "native") {
          xlm = b.balance;
        } else if ("asset_code" in b) {
          if (b.asset_code === "EURC") eurc = b.balance;
          if (b.asset_code === "USDC") usdc = b.balance;
        }
      }
      setBalances({ xlm, eurc, usdc });
    } catch (err: unknown) {
      // Account may not be funded on Testnet
      const str = String(err);
      if (str.includes("404")) {
        setBalances({ xlm: "Unfunded (0.00)" });
      }
    }
  };

  // Connect Freighter
  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    setStatusMessage("Requesting Freighter Testnet authorization...");

    try {
      const connCheck = await isConnected();
      const connected =
        typeof connCheck === "object" && connCheck !== null
          ? connCheck.isConnected
          : Boolean(connCheck);

      if (!connected) {
        setIsFreighterInstalled(false);
        setErrorMessage("Freighter extension not detected. Please install Freighter from freighter.app.");
        setIsConnecting(false);
        return;
      }

      setIsFreighterInstalled(true);
      const accessRes = await requestAccess();
      if (accessRes.error) {
        throw new Error(
          typeof accessRes.error === "string"
            ? accessRes.error
            : "Freighter access request denied"
        );
      }

      const userAddr = accessRes.address;
      setAddress(userAddr);
      setStatusMessage(`Connected: ${userAddr.slice(0, 6)}...${userAddr.slice(-4)}`);
      await fetchNetworkAndBalances(userAddr);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setStatusMessage(null);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect
  const handleDisconnect = () => {
    setAddress(null);
    setBalances(null);
    setAttestationTxHash(null);
    setStatusMessage(null);
    setErrorMessage(null);
  };

  // Sign Live Vault Attestation on Stellar Testnet
  const handleSignAttestation = async () => {
    if (!address) return;
    setIsAttesting(true);
    setErrorMessage(null);
    setStatusMessage("Building real Stellar Testnet attestation transaction...");

    try {
      const server = new Horizon.Server(HORIZON_TESTNET);
      let account: Horizon.AccountResponse;

      try {
        account = await server.loadAccount(address);
      } catch (err: unknown) {
        const str = String(err);
        if (str.includes("404")) {
          throw new Error(
            `Account ${address.slice(0, 8)}... is not funded on Stellar Testnet. Please fund it with testnet XLM using the Stellar Friendbot or faucet.`
          );
        }
        throw err;
      }

      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.manageData({
            name: "portus_vault_attest",
            value: vaultContractId.slice(0, 48),
          })
        )
        .setTimeout(60)
        .build();

      setStatusMessage("Opening Freighter popup for signature...");
      const signRes = await signTransaction(tx.toXDR(), {
        networkPassphrase: Networks.TESTNET,
        address,
      });

      if (signRes.error) {
        throw new Error(
          typeof signRes.error === "string"
            ? signRes.error
            : "Freighter signature cancelled or rejected"
        );
      }

      setStatusMessage("Submitting signed attestation directly to Stellar Testnet Horizon...");
      const signedTx = TransactionBuilder.fromXDR(
        signRes.signedTxXdr,
        Networks.TESTNET
      );
      const submitRes = await server.submitTransaction(signedTx);

      setAttestationTxHash(submitRes.hash);
      setStatusMessage("Attestation confirmed on Stellar Testnet!");
      // Refresh balances
      await fetchNetworkAndBalances(address);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setStatusMessage(null);
    } finally {
      setIsAttesting(false);
    }
  };

  // Add SAC Token to Freighter
  const handleAddToken = async (contractId: string, symbol: "EURC" | "USDC") => {
    setTokenStatus((prev) => ({ ...prev, [symbol]: "adding" }));
    try {
      const res = await addToken({
        contractId,
        networkPassphrase: Networks.TESTNET,
      });
      if (res && res.error) {
        throw new Error(typeof res.error === "string" ? res.error : "Token import declined");
      }
      setTokenStatus((prev) => ({ ...prev, [symbol]: "added" }));
      setTimeout(() => {
        setTokenStatus((prev) => ({ ...prev, [symbol]: "idle" }));
      }, 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Failed to add ${symbol}: ${msg}`);
      setTokenStatus((prev) => ({ ...prev, [symbol]: "error" }));
    }
  };

  return (
    <div className="bg-[#0C0F14] text-[#F6F5F1] rounded-2xl p-6 sm:p-8 shadow-md mb-10 border border-white/10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#D4A24C]" aria-hidden="true" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#D4A24C] font-semibold">
              Stellar Testnet Browser Wallet
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight mt-1">
            Freighter Wallet Connection & Vault Attestation
          </h3>
          <p className="text-xs text-white/75 mt-0.5 max-w-xl">
            Connect your browser Freighter wallet to sign live on-chain treasury vault attestations
            and import Portus EURC/USDC SAC tokens directly into your wallet.
          </p>
        </div>

        {/* Status indicator / Disconnect */}
        <div className="flex items-center gap-3">
          {address ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#065F46]/20 border border-[#065F46]/40 text-[#34D399] text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" aria-hidden="true" />
                <span>Connected ({networkName || "Testnet"})</span>
              </span>
              <button
                onClick={handleDisconnect}
                className="inline-flex items-center justify-center min-h-8 py-1.5 px-3 rounded-md text-xs font-mono font-medium text-white/75 bg-white/10 hover:bg-white/20 hover:text-white transition-all focus-visible:outline-2 focus-visible:outline-[#34D399]"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="inline-flex items-center justify-center gap-2 min-h-8 py-2 px-4 rounded-md text-xs font-semibold text-white bg-[#065F46] hover:bg-[#047857] disabled:opacity-50 active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-[#34D399] shadow-sm"
            >
              {isConnecting ? (
                <span>Connecting Freighter...</span>
              ) : (
                <>
                  <span>Connect Freighter Wallet</span>
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Extension not installed notice */}
      {isFreighterInstalled === false && !address && (
        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 mb-6 text-xs font-mono text-white/75 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-[#D4A24C] text-base leading-none mt-0.5" aria-hidden="true">
              ℹ
            </span>
            <div>
              <span className="text-white font-semibold block font-sans text-sm">
                Freighter Extension Not Detected
              </span>
              <span className="text-white/75 leading-relaxed block mt-0.5">
                Install Freighter from{" "}
                <a
                  href="https://www.freighter.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4A24C] hover:underline inline-flex items-center gap-1 font-semibold min-h-8 py-1 px-1 focus-visible:outline-2 focus-visible:outline-[#34D399]"
                >
                  freighter.app
                  <span aria-hidden="true">↗</span>
                </a>{" "}
                to sign real Testnet transactions in your browser. Judge Instant Mode remains fully functional below!
              </span>
            </div>
          </div>
          <button
            onClick={handleConnect}
            className="self-start sm:self-auto shrink-0 inline-flex items-center justify-center min-h-8 py-1.5 px-3.5 rounded-md text-xs font-semibold text-[#0C0F14] bg-[#D4A24C] hover:bg-[#C59A45] transition-all focus-visible:outline-2 focus-visible:outline-[#34D399]"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Connected State Workspace */}
      {address && (
        <div className="space-y-6">
          {/* Account Details & Balances Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* Account ID */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <span className="text-white/75 block text-[10px] uppercase tracking-wider mb-1">
                Connected Stellar Testnet Account
              </span>
              <div className="text-white font-semibold truncate select-all">
                {address}
              </div>
              <div className="mt-2 flex items-center gap-3">
                <a
                  href={stellarExpertAccountUrl(address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#34D399] hover:underline text-[11px] min-h-8 py-1 px-1"
                >
                  <span>Stellar Expert</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>

            {/* Testnet XLM Balance */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <span className="text-white/75 block text-[10px] uppercase tracking-wider mb-1">
                Native Testnet Gas (XLM)
              </span>
              <div className="text-lg font-bold text-white tabular-nums">
                {balances ? `${balances.xlm} XLM` : "Loading..."}
              </div>
              <div className="text-[11px] text-white/75 mt-1">
                SDF Testnet Reserve
              </div>
            </div>

            {/* SAC Token Balances */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <span className="text-white/75 block text-[10px] uppercase tracking-wider mb-1">
                Portus SAC Holdings
              </span>
              <div className="text-sm font-semibold text-white tabular-nums space-y-0.5">
                <div>EURC: {balances?.eurc ? `${balances.eurc} EURC` : "0.00 (No trustline)"}</div>
                <div>USDC: {balances?.usdc ? `${balances.usdc} USDC` : "0.00 (No trustline)"}</div>
              </div>
            </div>
          </div>

          {/* Action Row: Attest & Add Tokens */}
          <div className="p-5 rounded-xl bg-black/30 border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Sign Attestation */}
            <div>
              <span className="text-xs font-bold text-white font-sans block">
                Sign Live On-Chain Vault Attestation
              </span>
              <span className="text-xs text-white/75 max-w-md block mt-0.5 font-sans">
                Submits a verified <code className="text-[#34D399]">manageData(portus_vault_attest)</code> operation
                directly to Stellar Testnet to record your cryptographic verification on-chain.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSignAttestation}
                disabled={isAttesting}
                className="inline-flex items-center justify-center gap-2 min-h-8 py-2.5 px-4 rounded-md text-xs font-semibold text-white bg-[#065F46] hover:bg-[#047857] disabled:opacity-50 active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-[#34D399]"
              >
                {isAttesting ? (
                  <span>Signing in Freighter...</span>
                ) : (
                  <>
                    <span>Sign Live Vault Attestation</span>
                    <span aria-hidden="true">✍</span>
                  </>
                )}
              </button>

              {/* 1-Click Import SAC Tokens */}
              <button
                onClick={() => handleAddToken(eurcSacId, "EURC")}
                className="inline-flex items-center justify-center min-h-8 py-2 px-3 rounded-md text-xs font-mono text-white/75 bg-white/10 hover:bg-white/20 hover:text-white transition-all focus-visible:outline-2 focus-visible:outline-[#34D399]"
                title="Import Portus EURC SEP-41 Contract Token to Freighter"
              >
                {tokenStatus.EURC === "adding"
                  ? "Importing EURC..."
                  : tokenStatus.EURC === "added"
                  ? "✓ EURC Added"
                  : "+ Add EURC SAC"}
              </button>

              <button
                onClick={() => handleAddToken(usdcSacId, "USDC")}
                className="inline-flex items-center justify-center min-h-8 py-2 px-3 rounded-md text-xs font-mono text-white/75 bg-white/10 hover:bg-white/20 hover:text-white transition-all focus-visible:outline-2 focus-visible:outline-[#34D399]"
                title="Import Portus USDC SEP-41 Contract Token to Freighter"
              >
                {tokenStatus.USDC === "adding"
                  ? "Importing USDC..."
                  : tokenStatus.USDC === "added"
                  ? "✓ USDC Added"
                  : "+ Add USDC SAC"}
              </button>
            </div>
          </div>

          {/* Success / Attestation Receipt Bar */}
          {attestationTxHash && (
            <div className="p-4 rounded-xl bg-[#065F46]/20 border border-[#065F46]/40 text-xs font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[#34D399] font-bold flex items-center gap-1.5 font-sans text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#34D399]" aria-hidden="true" />
                    Live Testnet Attestation Confirmed
                  </span>
                  <div className="text-white/75 mt-1 truncate max-w-md sm:max-w-lg select-all">
                    Tx Hash: {attestationTxHash}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={stellarExpertTxUrl(attestationTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 min-h-8 py-1.5 px-2.5 rounded-md text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition-all focus-visible:outline-2 focus-visible:outline-[#34D399]"
                  >
                    <span>Verify on Stellar Expert</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                  <a
                    href={stellarLabTxUrl(attestationTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 min-h-8 py-1.5 px-2.5 rounded-md text-xs font-semibold text-[#0C0F14] bg-[#D4A24C] hover:bg-[#C59A45] transition-all focus-visible:outline-2 focus-visible:outline-[#34D399]"
                  >
                    <span>Open in Stellar Lab</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && !attestationTxHash && (
            <div className="text-xs font-mono text-[#34D399] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" aria-hidden="true" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-[#B91C1C]/20 border border-[#B91C1C]/40 text-xs font-mono text-[#FCA5A5]">
              <span className="font-bold mr-2">Error:</span>
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
