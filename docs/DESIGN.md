# Mercury Geometric & Structural Design System (Portus Edition)

> Structural and geometric rules extracted from Mercury's design language. 
> NOTE: Colors in this system are strictly superseded by Portus tokens in the root `AGENTS.md` (Pine/Emerald `#0B3B2C` / `#10B981`, Brass `#D4A24C`, Obsidian `#0C0F14`). All indigo, periwinkle, and violet references are removed.

---

## 1. Typography System

### Font Family
- **Display & Headlines:** Inter (variable, open fit with +0.01em tracking at display sizes).
- **Body & UI:** Inter (variable, light weights).
- **Numbers & Telemetry:** Mono (`JetBrains Mono`, `tabular-nums`) — Portus invariant.

### Hierarchy & Weights

| Token | Size | Weight | Line Height | Letter Spacing | Use Case |
|---|---|---|---|---|---|
| `stat` | 60px | 480 | 1.1 | 0 | Stat numerals, large metrics |
| `display` | 52px | 480 | 1.1 | 0 | Hero headlines |
| `heading-1` | 42px | 480 | 1.15 | +0.42px | Major section titles |
| `heading-2` | 28px | 480 | 1.2 | +0.42px | Card titles, module headers |
| `lead` | 24px | 480 | 1.2 | +0.48px | Lead statements, summary blurbs |
| `body-lg` | 18px | 360 | 1.35 | 0 | Card descriptions, intro text |
| `body` | 16px | 400 | 1.4 | 0 | Standard narrative copy |
| `ui` | 16px | 420 | 1.0 | 0 | Primary buttons, nav links, inputs |
| `ui-sm` | 14px | 420 | 1.0 | +0.07px | Compact pill tags, table labels |
| `eyebrow` | 14px | 500 | 1.0 | +0.28px | Small uppercase category badges |
| `legal` | 12px | 400 | 1.4 | +0.24px | Captions, timestamps, disclaimers |

### Core Typography Principles
- **Unusually light variable weights:** Headlines sit at `480`, UI labels at `420`, body copy at `360–400`. Hierarchy is driven by scale and contrast, never heavy bold weights (`600/700` are banned for text).
- **Positive tracking on headlines:** Slight positive tracking (`+0.01em` to `+0.42px`) instead of negative tightening creates a spacious, gallery-like pace.
- **Uppercase discipline:** Uppercase is strictly reserved for small `eyebrow` labels.

---

## 2. Spacing & Grid System

### Spacing Scale (8px Base Grid)
- `spacing.xs`: 8px
- `spacing.sm`: 12px
- `spacing.md`: 16px
- `spacing.lg`: 20px
- `spacing.xl`: 24px
- `spacing.xxl`: 32px (standard card padding)
- `spacing.huge`: 40px
- `spacing.section`: 80px (minimum section separation)
- `spacing.section-lg`: 128px (major landmark separation)

### Container & Layout Rhythm
- **Max Container Width:** 1140px – 1280px, horizontally centered.
- **Headline Width:** Constrained to ~640px to prevent uncomfortably wide line wraps.
- **Section Rhythm:** Nav → Hero → 2/3-Up Card Grids → Data Telemetry Module → Footer.
- **Whitespace Pace:** Generous vertical padding gives every section a calm, institutional rhythm.

---

## 3. Shapes & Corner Radii

| Token | Value | Applied To |
|---|---|---|
| `--radius-none` | 0px | Full-bleed strips, table row boundaries |
| `--radius-xs` | 4px | Small inline code tags, status dots |
| `--radius-sm` | 6px | Small inputs, badges |
| `--radius-card-sm` | 8px | Sub-cards, inner module cells |
| `--radius-card` | **12px** | **All institutional cards, panels, containers** |
| `--radius-pill-primary` | **32px** | **Primary solid action buttons** |
| `--radius-pill-secondary`| **40px** | **Secondary translucent/glass action pills** |
| `--radius-pill` | 9999px | Full capsule toggles, category badges |

---

## 4. Component Geometry & Button Architecture

### Button Rules
- **Rule of Single Dominance:** In any view or module, there is strictly **at most ONE solid filled action button**.
- **Primary Action Pill:**
  - Height: 40px, padding: 0 20px.
  - Border radius: `var(--radius-pill-primary)` (32px).
  - Background: Portus Pine/Emerald (`#0B3B2C` / `#10B981`), text: `#FFFFFF`.
- **Secondary Glass/Translucent Pill:**
  - Height: 40px, padding: 0 20px.
  - Border radius: `var(--radius-pill-secondary)` (40px).
  - Background: 15–20% translucent fill with a 1px hairline border (`rgba(255,255,255,0.12)`).
  - Text: `#EDEDF3`.

### Card Geometry
- **Padding:** 24px (mobile) to 32px (desktop).
- **Corner Radius:** Strictly `var(--radius-card)` (12px).
- **Borders:** 1px hairline (`border border-white/[0.08]` on dark; `border border-[rgba(12,15,20,0.08)]` on light).
- **Elevation:** Tonal surface lifting (`#12161F` on `#0C0F14`), zero cartoonish drop shadows.

---

## 5. Responsive Breakpoints & Touch Targets

| Breakpoint | Width | Behavior |
|---|---|---|
| **Desktop** | ≥ 1200px | Full 3-up card grids, side-by-side terminal inspector |
| **Laptop** | 1024–1199px | 2-up grids, fluid font scaling |
| **Tablet** | 768–1023px | Grids reflow 2-up to stacked, controls expand |
| **Mobile** | < 768px | 1-column stacked cards, navigation collapses to accessible drawer |

### Touch Target Floor
All interactive elements maintain a bounding box of at least 44px on touch devices and a minimum height of 32px (`min-h-8`) with `py-1.5 px-3` on desktop.

---

## 6. Do's and Don'ts

### Do
- Keep text weights light: headlines at `480`, UI at `420`, body at `360–400`.
- Maintain strictly 12px corner radii on all card containers.
- Use a single solid action pill per module; secondary actions must be translucent glass.
- Use `tabular-nums font-mono` for all numeric figures, financial amounts, and hashes.

### Don't
- **Never use indigo, periwinkle, lavender, or violet.**
- Never set headings in `font-bold` (`700`) or heavy black weights.
- Never use 24px or 32px corner radii on card containers (those belong to pills).
- Never use heavy drop shadows; depth is achieved via tonal surface elevation and hairlines.
