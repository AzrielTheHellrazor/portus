import type { Metadata } from "next";
import { fontSans, fontDisplay, fontMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://portus.stellar.org"),
  alternates: {
    canonical: "./",
  },
  title: "Portus · Institutional Multi-Currency Treasury on Stellar",
  description:
    "Hold euros. Spend dollars. Instantly settle multi-currency treasury outlays under Soroban spend policies and x402 micropayments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen min-h-[100dvh] flex flex-col bg-canvas text-text antialiased selection:bg-action-mint selection:text-text">
        <main id="main-content" tabIndex={-1} className="flex-1 w-full outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
