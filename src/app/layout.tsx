import type { Metadata } from "next";
import { fontSans, fontMono } from "./fonts";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Motion } from "@/components/Motion";
import { SmoothScroll } from "@/engine/SmoothScroll";
import { site } from "@/data/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Portus · Institutional Multi-Currency Treasury on Stellar",
    template: "%s | Portus Treasury",
  },
  description: site.description,
  keywords: [
    "Stellar",
    "Soroban",
    "EURC",
    "USDC",
    "Treasury Management",
    "CAP-0085",
    "CAP-0086",
    "x402",
    "Passkey",
    "secp256r1",
    "WebAuthn",
    "HackMeridian 2026",
    "Lisbon",
  ],
  authors: [{ name: "Portus Engineering Consortium" }],
  creator: "Portus",
  publisher: "Stellar Network",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    title: "Portus · Institutional Multi-Currency Treasury on Stellar",
    description: site.description,
    siteName: site.name,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Portus Treasury Protocol",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portus · Institutional Multi-Currency Treasury on Stellar",
    description: site.description,
    images: ["/opengraph-image"],
  },
};

const flagsScript = `
  document.documentElement.classList.add('js');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('motion');
  }
`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Portus Treasury",
  "applicationCategory": "FinancialApplication",
  "operatingSystem": "Stellar Network Protocol 29",
  "description": site.description,
  "offers": {
    "@type": "Offer",
    "price": "0.00",
    "priceCurrency": "EUR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: flagsScript }} />
      </head>
      <body className="min-h-screen min-h-[100dvh] flex flex-col bg-[#F6F5F1] text-[#0C0F14] antialiased selection:bg-[#0B3B2C] selection:text-white">
        {/* Skip to Content - First Focusable Element */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Engine Curtain & Loader Layers */}
        <div id="curtain" aria-hidden="true">
          <div className="curtain__panel" />
        </div>

        <div id="loader" role="status" aria-label="Loading Portus Treasury System">
          <div className="loader__inner">
            <div className="flex flex-col">
              <span className="text-xs uppercase font-mono tracking-widest text-[#785316] font-semibold" data-loader-out>
                Portus · Lisbon Clearinghouse
              </span>
              <span className="text-2xl sm:text-3xl font-bold font-sans text-[#0C0F14] tracking-tight mt-1" data-loader-out>
                Initializing Stellar Vault Engine
              </span>
            </div>
            <span
              className="text-2xl sm:text-3xl font-bold font-mono text-[#0B3B2C] tabular-nums"
              data-loader-out
              data-loader-count
            >
              000%
            </span>
          </div>
          <div className="loader__bar" data-loader-bar />
        </div>

        {/* Header Navigation */}
        <Header />

        {/* Main Content Landmark */}
        <main id="main-content" tabIndex={-1} className="flex-1 w-full outline-none">
          {children}
        </main>

        {/* Footer Landmark */}
        <Footer />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />

        {/* Smooth Scroll & Motion Adapter */}
        <SmoothScroll />
        <Motion />
      </body>
    </html>
  );
}
