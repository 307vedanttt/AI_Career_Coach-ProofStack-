# ProofStack Auth Screens - Design Reference & Specifications

Extracted from Stitch Project `16985922956838828053`, Stitch screens `c8f43b599a8a49888ab0c83615fc59d3` (Sign In) and `9cf6518929bc44ca9d2f1c7eab375941` (Create Account), and state flow requirements.

## Screen Inventory
1. **Login Desktop** (`/login`):
   - Split layout: 55% left "proof side", 45% right auth panel.
   - Left side: Tilted stacked receipt with `PROVEN` rubber stamp slamming down, code block showing invariant check, and headline "Welcome back. Your receipts are waiting."
   - Right side: Dark glass panel (`#12161B`), GitHub OAuth action button (`Continue with GitHub`), OR divider, "Scan a public profile, no sign in" link, 3-column trust badge strip (Read only, Public repos, Delete anytime), footer link to `/signup`.
2. **Sign up Desktop** (`/signup`):
   - Left side: Vertical 3-step preview with connecting SVG line (01 Connect GitHub, 02 Paste a real posting, 03 See your receipts). Headline "Start with what your code already proves."
   - Right side: "What we ask GitHub for" perforated receipt sub-card, two custom interactive checkboxes with stroke-animated checkmarks. Primary button "Sign up with GitHub" disabled until BOTH checkboxes checked; glows emerald upon enabling.
3. **Mobile Login** (`< 1024px`):
   - Collapses to single column. Left side collapses into a compact receipt peeking from the top (sawtooth edge).
   - Buttons 52px height, font minimum 16px.
4. **Redirecting State** (`/auth/redirecting`):
   - Minimal high-security state.
   - Animated pulsing line connecting the GitHub Octocat logo and the ProofStack logo.
   - Live status indicator: "Contacting GitHub OAuth API..."
5. **Consent Receipt State** (`/auth/consent`):
   - Physical notarized receipt card detailing OAuth scopes:
     - Account identity (read:user)
     - Access level: Read-only
     - Repos: Public repositories only
     - Storage: Evidence snippets and verified hashes only
   - Actions: "Allow & Continue" -> `/app`, "Cancel" -> `/login`.
6. **Error State** (`/auth/error?reason=...`):
   - Red allowed ONLY on this screen (`#C2362B`, phosphor glow `#FF5C4D`, stamp `REFUSED` / `ATTACK`).
   - 4px horizontal shake animation on load.
   - Validates query param `reason` (e.g. `declined`, `session_expired`, `rate_limit_exceeded`, `network_error`) with generic fallback.
   - Actions: "Try again" (links to `/login` / retry) and "Scan without signing in" (links to `/scan`).
7. **Rate Limited State** (`/auth/rate-limited?retry_after=...`):
   - Amber warning stamp `BASIC` / clock icon.
   - Computed countdown timer driven by `retry_after` query param (seconds, e.g. `?retry_after=45`), never hardcoded.
   - Auto-refreshes or enables retry button when countdown hits 0.

## New Tokens & Components Required vs tokens.md:
- **New Components**:
  1. `SplitLayout`: 55% left proof side / 45% right auth panel on desktop (>=1024px), responsive collapse on mobile (<1024px) with top peeking receipt.
  2. `AuthPanel`: Dark glass panel (`#12161B` with `rgba(255, 255, 255, 0.08)` border, `24px` backdrop blur, staggered entrance animation).
  3. `CustomCheckbox`: Accessible checkbox with stroke-dashoffset animated checkmark, `aria-disabled` and `aria-describedby` helper text.
  4. `StepPreview`: Vertical 3-step progress track with animated vertical connector line and monospaced step numbers.
  5. `OAuthPulseConnector`: Animated pulsing SVG connector between GitHub and ProofStack logos for `/auth/redirecting`.
  6. `ConsentReceipt`: Physical paper card showing requested GitHub scopes and hash-only storage commitments.
- **Tokens (Consistent with tokens.md)**:
  - Surface: `#0A0C0F` desk canvas with dot grid, `#12161B` dark panel.
  - Accent: `#1F8A5B` (Emerald glow `#34D399`), `#C2362B` (Error red, used strictly on error state).
  - Fonts: Instrument Serif, Inter, JetBrains Mono.
