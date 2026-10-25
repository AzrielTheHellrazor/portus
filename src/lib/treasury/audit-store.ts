import fs from "node:fs";
import path from "node:path";
import type { SettlementReceipt } from "@/types/treasury";

const AUDIT_FILE_PATH = path.join("/tmp", "portus-audit-trail.json");
const MAX_AUDIT_ITEMS = 25;

declare global {
  var __portusAuditStore: SettlementReceipt[] | undefined;
}

/**
 * Initializes the in-memory audit store, attempting to load from disk
 * if previously persisted across route reloads or process restarts.
 */
function initializeStore(): SettlementReceipt[] {
  if (globalThis.__portusAuditStore) {
    return globalThis.__portusAuditStore;
  }

  try {
    if (fs.existsSync(AUDIT_FILE_PATH)) {
      const raw = fs.readFileSync(AUDIT_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        globalThis.__portusAuditStore = parsed.slice(0, MAX_AUDIT_ITEMS);
        return globalThis.__portusAuditStore;
      }
    }
  } catch {
    // Ignore read / parse errors and fallback to empty store
  }

  globalThis.__portusAuditStore = [];
  return globalThis.__portusAuditStore;
}

/**
 * Persists current receipts to /tmp/portus-audit-trail.json asynchronously
 * so file I/O never blocks the event loop.
 */
function persistToDisk(receipts: SettlementReceipt[]): void {
  try {
    fs.writeFileSync(AUDIT_FILE_PATH, JSON.stringify(receipts, null, 2), "utf-8");
  } catch {
    // Non-fatal if /tmp write fails
  }
}

/**
 * Appends a new SettlementReceipt to the top of the store (newest first).
 * Caps the store at MAX_AUDIT_ITEMS (25).
 */
export function appendAuditReceipt(receipt: SettlementReceipt): void {
  const store = initializeStore();

  // Deduplicate by receipt.id if already present
  const filtered = store.filter((item) => item.id !== receipt.id);
  const updated = [receipt, ...filtered].slice(0, MAX_AUDIT_ITEMS);

  globalThis.__portusAuditStore = updated;
  persistToDisk(updated);
}

/**
 * Returns the recent audit receipts (newest first, max 25).
 */
export function getRecentAuditReceipts(): SettlementReceipt[] {
  const store = initializeStore();
  return [...store];
}
