"use client";

import { useState, useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import { TreasuryCockpit } from "@/components/treasury/TreasuryCockpit";
import { X402Inspector } from "@/components/treasury/X402Inspector";
import { FleetGrid } from "@/components/treasury/FleetGrid";
import {
  INITIAL_TREASURY_SNAPSHOT,
  REFERENCE_X402_TRACE,
  REFERENCE_INTELLIGENCE_PAYLOAD,
} from "@/data/site";
import type { TreasuryStateSnapshot, SettlementReceipt, X402WireStep } from "@/types/treasury";

export default function HomePage() {
  const [snapshot, setSnapshot] = useState<TreasuryStateSnapshot>(INITIAL_TREASURY_SNAPSHOT);
  const [activeWireTrace, setActiveWireTrace] = useState<X402WireStep[]>(REFERENCE_X402_TRACE);
  const [activeIntelligence, setActiveIntelligence] = useState<Record<string, unknown>>(
    REFERENCE_INTELLIGENCE_PAYLOAD
  );

  // Poll or fetch live state on mount from /api/treasury/state if available
  useEffect(() => {
    let isMounted = true;
    async function fetchState() {
      try {
        const res = await fetch("/api/treasury/state");
        if (res.ok && isMounted) {
          const data: TreasuryStateSnapshot = await res.json();
          setSnapshot(data);
        }
      } catch {
        // Fallback to rich initial state
      }
    }
    fetchState();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleReceiptGenerated = (receipt: SettlementReceipt) => {
    if (receipt.x402WireTrace && receipt.x402WireTrace.length > 0) {
      setActiveWireTrace(receipt.x402WireTrace);
    }
    if (receipt.intelligencePayload) {
      setActiveIntelligence(receipt.intelligencePayload);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <HeroSection state={snapshot} />
      <TreasuryCockpit
        initialState={snapshot}
        onReceiptGenerated={handleReceiptGenerated}
      />
      <X402Inspector
        wireTrace={activeWireTrace}
        intelligencePayload={activeIntelligence}
      />
      <FleetGrid
        fleet={snapshot.fleet}
        factoryContractId={snapshot.factoryContractId}
        onSubsidiaryDeployed={(record) => {
          setSnapshot((prev) => ({
            ...prev,
            fleet: [record, ...(prev.fleet ?? []).filter((v) => v.subsidiaryCode !== record.subsidiaryCode)],
          }));
        }}
      />
    </div>
  );
}
