import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24 text-center bg-canvas text-text selection:bg-action-mint selection:text-text font-sans">
      <title>404 — Route Unindexed | Portus</title>

      <div className="px-3 py-1 rounded-pill bg-surface-soft border border-hairline font-mono text-xs text-text-2 mb-6">
        ERROR 404
      </div>

      <h1 className="text-3xl sm:text-4xl font-display font-bold text-text mb-3 tracking-tight">
        Ledger Route Unindexed
      </h1>

      <p className="text-sm text-text-2 max-w-md leading-relaxed mb-8 font-sans">
        The requested treasury route or instance does not exist in the Portus state database.
      </p>

      <Link
        href="/"
        className="px-6 py-2.5 rounded-pill bg-action text-action-text text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Return to Cockpit
      </Link>
    </div>
  );
}
