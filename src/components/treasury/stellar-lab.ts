/**
 * Stellar Lab & Stellar Expert deep-linking utilities for Stellar Testnet.
 * Provides canonical SDF Lab state hash formatting and Stellar Expert links.
 */

export const LAB_TESTNET_QUERY =
  "$=network$id=testnet&label=Testnet&horizonUrl=https:////horizon-testnet.stellar.org&rpcUrl=https:////soroban-testnet.stellar.org&passphrase=Test%20SDF%20Network%20/;%20September%202015;;";

/**
 * Returns a direct deep link to inspect a Soroban smart contract in official SDF Stellar Lab on Testnet.
 */
export function stellarLabContractUrl(contractId: string): string {
  if (!contractId) {
    return `https://lab.stellar.org/smart-contracts/contract-explorer?${LAB_TESTNET_QUERY}`;
  }
  return `https://lab.stellar.org/smart-contracts/contract-explorer?$=network$id=testnet&label=Testnet&horizonUrl=https:////horizon-testnet.stellar.org&rpcUrl=https:////soroban-testnet.stellar.org&passphrase=Test%20SDF%20Network%20/;%20September%202015;&smartContracts$explorer$contractId=${contractId};;`;
}

/**
 * Returns a direct deep link to inspect a transaction in official SDF Stellar Lab on Testnet.
 */
export function stellarLabTxUrl(txHash?: string): string {
  if (!txHash) {
    return `https://lab.stellar.org/endpoints/horizon/transactions/single?${LAB_TESTNET_QUERY}`;
  }
  return `https://lab.stellar.org/endpoints/horizon/transactions/single?$=network$id=testnet&label=Testnet&horizonUrl=https:////horizon-testnet.stellar.org&rpcUrl=https:////soroban-testnet.stellar.org&passphrase=Test%20SDF%20Network%20/;%20September%202015;&endpoints$horizon$transactions$single$txId=${txHash};;`;
}

/**
 * Returns Stellar Expert Explorer URL for Soroban contracts.
 */
export function stellarExpertContractUrl(contractId: string): string {
  return `https://stellar.expert/explorer/testnet/contract/${contractId}`;
}

/**
 * Returns Stellar Expert Explorer URL for transactions.
 */
export function stellarExpertTxUrl(txHash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}

/**
 * Returns Stellar Expert Explorer URL for Stellar accounts (G...).
 */
export function stellarExpertAccountUrl(accountId: string): string {
  return `https://stellar.expert/explorer/testnet/account/${accountId}`;
}
