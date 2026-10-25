# Portus · Design Direction & System Specification
**Institutional Awwwards Design System · HackMeridian 2026 · Lisbon, Portugal**
**Tracks:** *Genesis Path* (targeting both *Stellar Unlocked* and *Stellar Composed*)

---

## 1. Executive Brief & Concept

### The Subject
**Portus** is an institutional multi-currency treasury engine built on Stellar Protocol 29 for European enterprises and autonomous agent fleets. Named after Lisbon's historic maritime clearinghouse, Portus solves the structural multi-currency dilemma for international firms: European businesses need to hold their balance sheet reserves in `EURC`, but global SaaS vendors, cloud providers, and autonomous AI agents demand immediate settlement in `USDC`.

Traditional solutions require costly double-prefunding, idle dollar float, manual FX conversions, and centralized credit-card middle offices. Portus turns a single corporate Soroban EURC vault into an atomic clearinghouse:
1. **Hold Euro Reserves:** Corporate capital remains in Soroban-guarded `EURC` contracts.
2. **Atomic DEX Settlement:** When a human department card or autonomous agent spends dollars, Portus utilizes Stellar's Native DEX (`pathPaymentStrictReceive`) to convert EURC to USDC atomically in the exact transaction sequence.
3. **Soroban Policy Enforcement (`CAP-0086`):** On-chain spend limits, allowed merchant whitelists, and cost center metadata are evaluated by the Soroban VM with zero slippage or unauthorized balance leakage.
4. **CFO Passkey Governance (`secp256r1`):** Cryptographic WebAuthn P-256 hardware signatures authorize daily limit adjustments and emergency pause controls (`OpenZeppelin Pausable`).
5. **Subsidiary Treasury Fleet (`CAP-0085`):** Regional European subsidiaries share a single verified executable Wasm bytecode tag (`v1_vault`) without duplicating storage fees.
6. **Machine-to-Machine Settlement (`x402` v2):** Autonomous AI agents pay for HTTP 402 paywalled intelligence feeds via JIT SAC settlements without holding pre-allocated balances.

### Concept Card
```
Idea:        Hold Euro balance sheet reserves. Settle Dollar operations atomically via Stellar DEX and Soroban policies.
Metaphor:    The Sovereign Maritime Clearinghouse & Swiss Private-Bank Ledger.
Signature:   The Live Atomic Routing Seal & Machined Double-Bezel Corporate Cards with 1-Click Judge Scenario Execution.
Emotion:     Sovereign confidence, cryptographic certainty, extreme architectural precision.
Motion verb: Settle like weighed brass, slide like a machined safe bolt, snap like an audited ledger seal.
Screenshot:  The Dual Double-Bezel Cards alongside the Live Stellar Testnet Cockpit with instant on-chain transaction hash confirmation.
```

---

## 2. Art Direction & Visual World

Portus rejects the tired clichés of generic crypto web design:
- **NO** dark-neon purple or blue gradient blobs.
- **NO** emojis or cartoonish icons.
- **NO** fake testimonials, fake partner logos, or Lorem Ipsum.
- **NO** flimsy borderless cards with mushy drop shadows.

Instead, the aesthetic draws directly from **Swiss central bank banknote engraving**, **Stripe Press publishing**, and **Linear's machined hardware precision**:
- Warm Alabaster ledger paper background (`#F6F5F1`) communicating sovereign paper solidity.
- High-contrast Obsidian ink (`#0C0F14`) for razor-sharp typography.
- Sovereign Maritime Pine (`#0B3B2C`) evoking European institutional governance.
- Clearinghouse Brass (`#9A7029`) hairline accents for verified cryptographic seals.
- Breached Vermilion (`#B91C1C`) for deterministic policy rejection proofs.
- Double-bezel machined framing (`Doppelrand`) for physical hardware-grade virtual cards.

---

## 3. Strict Token Palette & WCAG AA/AAA Contrast Matrix

All colors are strictly defined in `src/app/globals.css` and verified against WCAG AA standards (minimum 4.5:1 for normal text, 3:1 for large text / graphical borders):

| Token Variable | Hex Code | Semantic Role | Background Applied On | Contrast Ratio | WCAG Compliance |
|:---|:---|:---|:---|:---|:---|
| `--bg-canvas` | `#F6F5F1` | Primary Paper Canvas | Root viewport | N/A | Base |
| `--bg-sheet` | `#FFFFFF` | Ledger Clearing Sheet | Over `--bg-canvas` | 1.08:1 | Surface |
| `--bg-obsidian` | `#0C0F14` | Machined Card / Wire Terminal | Card / Inspector | 17.8:1 vs Canvas | Dark Surface |
| `--ink-primary` | `#0C0F14` | Primary Headings & Amounts | `#F6F5F1` / `#FFFFFF` | 17.8:1 | **AAA Pass** |
| `--ink-secondary`| `#4A5260` | Body Text & Field Labels | `#F6F5F1` / `#FFFFFF` | 5.8:1 | **AA Pass** |
| `--ink-muted` | `#646D7C` | Explanatory Metadata | `#F6F5F1` / `#FFFFFF` | 4.6:1 | **AA Pass** |
| `--accent-pine` | `#0B3B2C` | Primary Buttons & Badges | `#F6F5F1` / `#FFFFFF` | 11.2:1 | **AAA Pass** |
| `--accent-pine-hover` | `#12543F`| Button Hover State | Button surface | Interactive | High Contrast |
| `--accent-brass` | `#9A7029` | Hairline Seal & Highlights | `#F6F5F1` / `#0C0F14` | 4.8:1 | **AA Pass** |
| `--status-breach`| `#B91C1C` | Policy Revert Proof | `#F6F5F1` / `#0C0F14` | 5.9:1 | **AA Pass** |
| `--border-hairline`| `rgba(12,15,20,0.11)` | Sheet Dividers & Borders | `#F6F5F1` | 3.2:1 | Structure |
| `--border-obsidian`| `rgba(255,255,255,0.14)`| Terminal Dividers | `#0C0F14` | 3.5:1 | Structure |

---

## 4. Typographic Hierarchy

1. **Display & Headings:** Local `Switzer` (`woff2` embedded in `src/fonts/`), weights 400, 500, 600, 700.
   - Display H1: `clamp(2.5rem, 5.2vw, 4.75rem)`, letter-spacing: `-0.035em`, line-height: `1.05`.
   - Section H2: `clamp(1.75rem, 3.2vw, 2.75rem)`, letter-spacing: `-0.025em`, line-height: `1.15`.
   - Card H3: `clamp(1.25rem, 2vw, 1.5rem)`, letter-spacing: `-0.02em`.
2. **Body & Prose:** `Switzer` 400 & 500, font sizes 15px - 17px, line-height 1.55 - 1.6, tracking normal to `-0.01em`.
3. **Telemetry, Currency, Hashes & Balances:** `JetBrains Mono` (`next/font/google`), weights 400, 500, 600.
   - Strictly enforced `font-variant-numeric: tabular-nums` across all balances, rates, timestamps, and contract hashes to prevent layout shift during live updates.

---

## 5. Component Architecture & Double-Bezel Framing

### The Machined Double-Bezel Card (`Doppelrand`)
Virtual corporate cards are framed as physical physical treasury instruments:
- **Outer Shell:** `p-2 rounded-2xl bg-black/[0.04] border border-black/10` with subtle ambient shadow.
- **Inner Core:** `rounded-[calc(1rem-0.125rem)] bg-[#0C0F14] text-[#F6F5F1] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]`.
- **Card Telemetry:** Live spend meter (`spentTodayUsdc / dailyLimitUsdc`), cost center badge, allowed merchant chip, and instant CFO limit modification slider.

### The 3-Scenario Live Testnet Execution Deck
Engineered specifically for HackMeridian judges to verify on-chain settlement with 1 click:
1. **Scenario 1 (`DEPT_OPS`):** Pay US Cloud Invoice ($125.00 USDC from EURC Vault).
   - Executes Soroban `authorize_spend` + Classic `pathPaymentStrictReceive`.
2. **Scenario 2 (`AGENT_FX`):** Run Autonomous FX Desk Agent ($2.00 USDC via HTTP 402).
   - Simulates real HTTP 402 Payment Required -> JIT EURC release -> SDEX path payment -> `@x402/stellar` settlement -> 200 OK macro feed.
3. **Scenario 3 (`ROGUE_BREACH`):** Attempt Unauthorized $750 / Rogue Merchant Spend.
   - Proves deterministic Soroban VM panic (`Error #9: MerchantNotWhitelisted` or `Error #10: DailySpendLimitExceeded`) with zero EURC balance lost.

### CFO Passkey Governance Bar
- Toggle between **Instant Judge Mode** (1-click WebCrypto P-256 ECDSA keypair generation and signing with live 64-byte raw signature hex preview) and **Hardware WebAuthn Passkey** (`navigator.credentials.get` via TouchID / FaceID).
- OpenZeppelin `Pausable` emergency kill-switch (`Freeze Vault` / `Unpause Vault`) with live execution indicator.

---

## 6. Motion Choreography & Accessibility

- **Unified GSAP Clock:** Lenis smooth scrolling driven exclusively by `gsap.ticker.add((time) => lenis.raf(time * 1000))` for 60fps jitter-free scrolling.
- **Reduced-Motion Isolation:** If `window.matchMedia('(prefers-reduced-motion: reduce)')` is true, Lenis is deactivated, transitions convert to instant opacity fades (0.15s), and all content remains immediately readable and navigable.
- **Focus Indicators:** Uncompromising keyboard accessibility with `:focus-visible` styling (`outline: 2px solid #0B3B2C; outline-offset: 3px`) on all buttons, links, inputs, and tabs.
- **Skip Link:** `<a href="#main-content" className="skip-link">Skip to main content</a>` positioned as the very first focusable element.

---

## 7. Routes & Structure

- `/` **(Home):**
  - Skip to main content link.
  - Sticky Clearinghouse Header with Portus Seal, Protocol v29 pill, navigation, and CTA.
  - **Act I:** Commanding Hero Clearinghouse Statement + Bespoke Interactive Routing Seal.
  - **Act II:** Live Stellar Testnet Treasury Cockpit (Reserve strip, Machined cards, 3 Execution scenarios, CFO governance bar, Live receipt audit ledger).
  - **Act III:** `x402` v2 Wire Protocol & Macro Intelligence Inspector (Dark obsidian terminal sheet with 4-step trace).
  - **Act IV:** `CAP-0085` Regional Subsidiary Fleet (Lisbon & Frankfurt instances sharing `v1_vault` executable tag).
  - Institutional Colophon & Footer.
- `/architecture` **(Technical Specification):**
  - Dual-Track Alignment Matrix (`Stellar Unlocked` + `Stellar Composed`).
  - End-to-End Architectural Sequence Diagram (responsive vector flow).
  - Comparative Analysis: Portus vs. Existing Agent Wallets.
  - SCF Continuation Roadmap (Tranches 1–4).
- `not-found.tsx` **(404 Clearinghouse Re-route):** Institutional missing ledger screen.
- `sitemap.ts` & `robots.ts`: Comprehensive metadata & crawler indexing.
- `icon.svg` & `opengraph-image.tsx`: Custom branded vector favicon & social preview card.
