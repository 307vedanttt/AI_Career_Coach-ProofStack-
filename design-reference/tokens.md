# ProofStack Design System Tokens

Extracted from Stitch Project `16985922956838828053` ("ProofStack Evidence Ledger UX") and design references across all 9 screens.

---

## 1. Palette & Surface Colors

### Canvas & Base Background
- **Desk Canvas Ink**: `#0A0C0F` (Dark desk background)
- **Desk Dot Grid**: `radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)` with `24px 24px` grid pitch
- **Desk Vignette**: `inset 0 0 180px rgba(0, 0, 0, 0.85)`
- **Ambient Glow Top-Left**: `rgba(31, 138, 91, 0.12)` (Emerald `#1F8A5B`) blurred `140px`
- **Ambient Glow Bottom-Right**: `rgba(109, 91, 208, 0.10)` (Iris Violet `#6D5BD0`) blurred `160px`

### Dark Panels & Cards
- **Panel Surface**: `#12161B`
- **Panel Border**: `1px solid rgba(255, 255, 255, 0.08)`
- **Glass Panel Fill**: `rgba(255, 255, 255, 0.035)` with `backdrop-filter: blur(24px)`
- **Glass Panel Inner Highlight**: `inset 0 1px 0 rgba(255, 255, 255, 0.12)`
- **Drawer Background**: `rgba(14, 17, 22, 0.90)` with `backdrop-filter: blur(40px)`, border-left `1px solid rgba(255, 255, 255, 0.12)`

### Physical Receipt Cards (The Only Light Objects)
- **Paper Canvas Substrate**: `#F7F5F0` (Secondary tint: `#FAF8F3`)
- **Paper Wash Sub-Panel**: `#F2EFE9` / `#FAF9F5`
- **Paper Ink Primary**: `#14171A` (Deep carbon ink)
- **Paper Ink Secondary**: `#4A5568` / `#575D65`
- **Paper Ink Muted**: `#6B7280` / `#717882` (Cryptographic hashes, git SHAs, serials)
- **Paper Border / Rule**: `#E6E1D6` (Precision document hairline rule)
- **Paper Dotted / Dashed Rule**: `#D3CDBD`

### Evidentiary Status Stamps & Tints
Status states are applied across badges, row highlights, and notarized seals. **Status is never conveyed by color alone; it always pairs an icon with an uppercase word.**

| Status | Solid Ink Hex | Phosphor Glow Hex | Paper Wash Tint Hex | Icon Symbol | Border Style |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PROVEN** | `#1F8A5B` | `#34D399` (`#22C58B`) | `#E7F4EE` | Checkmark (`✓` / `check_circle`) | 3.5px double / solid double |
| **BASIC** | `#B7791F` | `#F5A524` | `#FBF1DC` | Half-circle (`◐` / `timelapse`) | 1.5px solid / double |
| **NOT SHOWN IN SCOPE** | `#64748B` | `#7C8CA8` | `#EEF1F5` | Dashed circle (`◌` / `remove_circle_outline`) | 2px dashed |
| **UNCLEAR** | `#6D5BD0` | `#8B7CFF` | `#EFECFB` | Question circle (`?` / `help_outline`) | 1.5px solid / double |
| **ATTACK / REGRESSION / ERROR** | `#C2362B` | `#FF5C4D` | `#FBE9E7` | Warning / Alert (`⚠` / `crisis_alert`) | 3.5px double |
| **REFUSED (Hollow Signal)** | `#C2362B` / `#FF5C4D` | `#FF5C4D` | `#FFF2F0` | Shield / Cancel (`⊘` / `shield`) | Pill badge + ping dot |

### Recommendation Style
- **Border Outline**: `2px dashed #1F8A5B` (or `#14171A` on light substrates)
- **Badge**: Unfilled or translucent surface with `RECOMMENDATION` tag in monospaced uppercase
- **Highlight**: Subtle glow `box-shadow: 0 0 30px rgba(31, 138, 91, 0.15)`

---

## 2. Typography

Self-hosted fonts only. No CDN imports.

| Role | Font Family | Typical Sizes & Weights | Letter Spacing | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display / Keynote** | `Instrument Serif`, Georgia, serif | 32px – 48px, Weight 400 | `-0.02em` | Section hero headlines, keynote contract sentences ("If your next commit adds one query...") |
| **UI Primary** | `Inter`, system-ui, sans-serif | 11px, 12px, 13px, 14px, 16px, 18px (Weights: 400, 500, 600, 700) | `-0.015em` to `0` | All primary UI labels, navigation, buttons, requirement names, narrative descriptions |
| **Code & Technical** | `JetBrains Mono`, monospace | 10px, 11px, 12px, 13px, 14px (Weights: 400, 500, 600) | `0.02em` to `0.06em` | Git commit SHAs, file paths, line numbers, code snippets, Merkle hashes, audit timestamps |
| **Status Stamp Badges** | `Inter` / `JetBrains Mono` | 11px – 13px, Weight 800 (Extra Bold / Black) | `0.14em` to `0.15em` (Caps) | Notarized rubber stamps (`PROVEN`, `BASIC`, `NOT SHOWN IN SCOPE`, `UNCLEAR`, `HOLLOW`) |

---

## 3. Radii & Geometry

- **Sharp Default (Mechanical Print & Cut Paper)**: `0px` for buttons, tables, base code blocks
- **Receipt Cards**: `6px` / `8px` (`rounded-md` / `rounded-lg`)
- **Panels & Dashboard Containers**: `16px` – `20px` (`rounded-2xl`)
- **Status Pills & Micro Stamps**: `3px` – `4px` (`rounded-sm`)
- **Notary Seals / Health Indicators / Hash Avatars**: `9999px` (`rounded-full`)

---

## 4. Elevation & Shadow Tokens

- **Desk Vignette**: `inset 0 0 180px rgba(0, 0, 0, 0.85)`
- **Glass Panel Depth**: `0 20px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)`
- **Receipt Floating Physical Shadow**: `0 35px 70px -15px rgba(0, 0, 0, 0.65), 0 15px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.9)`
- **Drawer Left Cast Shadow**: `-24px 0 80px rgba(0, 0, 0, 0.85)`
- **Active Phosphor Glow (Emerald)**: `box-shadow: 0 0 0 2px #1F8A5B, 0 0 25px rgba(52, 211, 153, 0.6)`
- **Hollow Signal Refusal Glow (Red)**: `box-shadow: 0 0 16px rgba(194, 54, 43, 0.7)`

---

## 5. Perforated Receipt Saw-Tooth Edge (CSS)

```css
.sawtooth-top {
  clip-path: polygon(
    0% 12px,
    2.5% 0px, 5% 12px, 7.5% 0px, 10% 12px, 12.5% 0px, 15% 12px, 17.5% 0px, 20% 12px,
    22.5% 0px, 25% 12px, 27.5% 0px, 30% 12px, 32.5% 0px, 35% 12px, 37.5% 0px, 40% 12px,
    42.5% 0px, 45% 12px, 47.5% 0px, 50% 12px, 52.5% 0px, 55% 12px, 57.5% 0px, 60% 12px,
    62.5% 0px, 65% 12px, 67.5% 0px, 70% 12px, 72.5% 0px, 75% 12px, 77.5% 0px, 80% 12px,
    82.5% 0px, 85% 12px, 87.5% 0px, 90% 12px, 92.5% 0px, 95% 12px, 97.5% 0px, 100% 12px,
    100% 100%,
    0% 100%
  );
}
```

---

## 6. Stamp Styles (CSS)

```css
.stamp-box {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  transform: rotate(-4deg);
  border: 3.5px double currentColor;
  border-radius: 3px;
  white-space: nowrap;
}

.stamp-box-proven {
  color: #1F8A5B;
  background: rgba(31, 138, 91, 0.12);
  box-shadow: 0 0 14px rgba(52, 211, 153, 0.35);
}

.stamp-box-basic {
  color: #B7791F;
  background: rgba(183, 121, 31, 0.12);
  box-shadow: 0 0 12px rgba(245, 165, 36, 0.35);
}

.stamp-box-not-shown {
  color: #64748B;
  background: rgba(100, 116, 139, 0.12);
  border-style: dashed;
  box-shadow: 0 0 12px rgba(124, 140, 168, 0.25);
}

.stamp-box-unclear {
  color: #6D5BD0;
  background: rgba(109, 91, 208, 0.12);
  box-shadow: 0 0 12px rgba(139, 124, 255, 0.35);
}

.stamp-box-error {
  color: #C2362B;
  background: rgba(194, 54, 43, 0.12);
  box-shadow: 0 0 16px rgba(255, 92, 77, 0.45);
}
```

---

## 7. Barcode Generator Simulation (CSS)

```css
.barcode-lines {
  background: repeating-linear-gradient(
    to right,
    #14171A 0px, #14171A 2px,
    transparent 2px, transparent 4px,
    #14171A 4px, #14171A 5px,
    transparent 5px, transparent 8px,
    #14171A 8px, #14171A 11px,
    transparent 11px, transparent 13px,
    #14171A 13px, #14171A 14px,
    transparent 14px, transparent 18px,
    #14171A 18px, #14171A 21px,
    transparent 21px, transparent 24px
  );
}
```
