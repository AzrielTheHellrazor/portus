import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-24 text-center bg-[#F6F5F1]">
      <title>404 — Ledger Route Unindexed | Portus</title>

      <div className="w-12 h-12 rounded-xl bg-[#0C0F14] text-[#D4A24C] flex items-center justify-center font-mono font-bold text-lg mb-6 shadow-sm">
        404
      </div>

      <span className="text-xs font-mono uppercase tracking-widest text-[#785316] font-semibold mb-2">
        Clearinghouse Record Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0C0F14] mb-4">
        Ledger Transaction or Route Unindexed
      </h1>

      <p className="text-sm text-[#4A5260] max-w-md leading-relaxed mb-8">
        The requested treasury record, subsidiary instance, or documentation route does not exist in the
        Portus Protocol 29 state database.
      </p>

      <Link
        href="/"
        className="inline-flex items-center justify-center gap-2 min-h-8 px-6 py-3 text-sm font-semibold text-white bg-[#0B3B2C] hover:bg-[#12543F] rounded-md shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-[#0B3B2C]"
      >
        <span>Return to Vault Cockpit</span>
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
