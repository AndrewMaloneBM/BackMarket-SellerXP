# Prototype Hub

This file is the source of truth for this workspace. Claude reads it automatically at the start of every session.

---

## First-time setup

If `app/app.config.ts` still contains `__TEAM_NAME__`, this is a fresh clone that hasn't been configured yet. Walk the user through setup:

1. Ask for their name and team name
2. Patch `app/app.config.ts` — replace `__TEAM_NAME__`, `__DESIGNER_NAME__`, `__TEAM_SLUG__` (slug = team name lowercased, spaces → hyphens)
3. Run `npm install` if `node_modules` doesn't exist
4. Ask if they want to deploy: `vercel --prod`
5. Tell them to run `npm run dev` to start locally

Alternatively, tell them to run `npm run setup` which does all of this automatically.

---

## Who & Why

**Andrew Malone** — Senior Product Designer, Back Market, Seller XP squad.  
This workspace exists to replace slow Figma-only workflows with fast, high-fidelity code prototypes for back-office concepts. Prototypes are shared with stakeholders via a live Vercel URL.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Nuxt 4 + Vue 3 (Composition API) |
| Styling | Tailwind CSS via `@nuxtjs/tailwindcss` |
| Design system | Back Market Revolve — real tokens, fonts, and icons wired up in `tailwind.config.ts` |
| Dev server | `npm run dev` — runs on port 3030 |
| Deployment | Vercel (`vercel --prod`) |

**Key config files:**
- `tailwind.config.ts` — BM colour tokens (`bm-green-*`, `bm-gray-*`), fonts, border radii
- `assets/css/main.css` — base component classes (`.btn`, `.card`, `.badge-*`)
- `nuxt.config.ts` — minimal, Tailwind module only

---

## Design Tokens (BM Revolve)

**Colours:**
- `bm-gray-*` (50–900) — neutral grey scale (Revolve raw.grey)
- `bm-surface` — page/section background (`hsl(228, 24%, 96%)`)
- `bm-text-hi` — high-emphasis text (`hsl(225, 21%, 7%)`)
- `bm-text-mid` — secondary text (`hsl(223, 7%, 20%)`)
- `bm-text-low` — caption text (`hsl(223, 4%, 37%)`)
- `bm-border` — default border (`hsl(225, 15%, 89%)`)
- `bm-success` — success action (`hsl(156, 100%, 21%)`)
- `#F2F3F7` — card background (grey.96, use where Tailwind token not available)

**Typography — real Revolve fonts (wired up, files in `public/fonts/`):**
- `font-heading-primary` — IvarSoft (serif) — heading-1, punchlines (h1 level, `text-2xl`+)
- `font-heading-secondary` — BMDupletDSP (display sans) — heading-2/3 (h2/h3 level, `text-xl` and below)
- `font-body` — BMDupletTXT (body sans) — all UI text, labels, captions (default)

**Icons — Revolve library (402 SVGs in `public/icons/`):**
- Use `<RevIcon name="IconName" class="w-4 h-4" />` for icons that don't need Tailwind color classes
- Keep inline SVG for icons that use `text-*` color (RevIcon renders as `<img>`, won't inherit color)

**Border radius:**
- `rounded-bm-xs` (2px), `rounded-bm-sm` (6px), `rounded-bm` (8px), `rounded-bm-lg` (12px)

---

## Project Structure

```
app/
  pages/
    index.vue                  ← Hub landing page (prototype registry)
    prototypes/
      money-tab.vue            ← BackFunds Money Tab concept explorer
  components/
    BmShell.vue                ← BM back-office shell (header + nav + tabs)
    PrototypeSidebar.vue       ← Collapsible concept/state sidebar
    RevIcon.vue                ← Revolve icon wrapper — <RevIcon name="IconName" class="w-4 h-4" />
  utils/
    mockBackFundsApi.ts        ← Typed mock API for BackFunds seller data
  assets/css/main.css
public/
  bm-logo.svg                  ← Back Market logo (64×32)
  fonts/                       ← Real Revolve font files (BMDupletTXT, BMDupletDSP, IvarSoft)
  icons/                       ← 402 Revolve SVG icons (IconName.svg)
design-system/                 ← Full Revolve guidelines (markdown + JSON tokens)
  Guidelines.md                ← Entry point — start here
  foundations/                 ← Color, typography, spacing, radius tokens (JSON co-located)
  components/                  ← All Rev* components — props, variants, when to use
  composition/                 ← Multi-component layout patterns
  content/                     ← Voice, tone, microcopy rules
  icons/                       ← icons.json catalog + usage guidance
  brand/                       ← Logo files and usage rules
scripts/
  new-prototype.mjs            ← Scaffold a new prototype page
```

**To scaffold a new prototype:**
```bash
npm run new-prototype -- "prototype-name"
```
Then register it in the `prototypes` array in `app/pages/index.vue`.

---

## Deployed Prototype Hub

**Live URL:** https://sellerxp-prototypes.vercel.app  
**Vercel project:** `sellerxp-prototypes` (account: `andrewmalonebm`, team: `andrewmalone-4296s-projects`)  
**Deploy command:** `vercel --prod` from this directory

The hub at `/` lists all registered prototypes as cards with title, description, tags, status badge, and a "View prototype →" link.

---

## Prototypes Built

### 1. BackFunds — Money Tab Concepts
**Route:** `/prototypes/money-tab`  
**Status:** In progress  
**Date:** April 2026  
**Tags:** BackFunds, Money, Seller BO  
**PM:** Seb (project sync 23 Apr 2026)

**What it is:**  
A 4-concept explorer for the BackFunds payout acceleration feature entry point on the Seller Back Office Money page. BackFunds is powered by Storfund and accelerates seller payouts from D+7 to D+1.

**Concept switcher:** left sidebar (collapsible, `w-72` / `w-12`), dark `bg-gray-950`. Uses `v-show` + `activeConcept = ref(1)`.

**The 4 concepts:**
| # | Name | Mechanic |
|---|---|---|
| 1 | Banner | Dismissible strip on Home + persistent banner on Money page |
| 2 | Dedicated Tab | 6th "Daily payout ●" tab in the Money sub-nav; full dedicated page |
| 3 | Grid Card | BackFunds card inserted as a 3rd column in the wallet card grid |
| 4 | Nudge Strip | Minimal inline strip above wallet sub-grid; dismissible |

**Full sidebar state tree:**

C1 — Banner:
- Home → Eligible banner / Applied status strip
- Money → Landing / Learn more modal / Steps 1–4 / Application submitted

C2 — Dedicated Tab:
- Eligible — not applied → Landing / Steps 1–4 / Application submitted
- Application under review (direct page)
- Active — daily advances (direct page)

C3 — Grid Card:
- Money → Card collapsed / Card expanded / Learn more modal / Steps 1–4 / Application submitted

C4 — Nudge Strip:
- Money → Nudge visible / Nudge dismissed / Learn more panel / Steps 1–4 / Application submitted

**Mock API** (`app/utils/mockBackFundsApi.ts`):
```ts
// Change status to test different states:
// "eligible" | "applied" | "under_review" | "active" | "ineligible"
return {
  storeExists: true,
  status: "eligible",
  sellerName: "TechRenew GmbH",
  estimatedDailyRate: 0.075,       // % per day
  estimatedMonthlyAdvance: 18740,  // EUR
  currency: "EUR",
  lastPayoutAmount: 23425,
  daysAccelerated: 6               // D+7 → D+1
}
```

**Monthly fee formula (Concept 2):**
```
estimatedMonthlyAdvance × (estimatedDailyRate / 100) × 30
```

**Deferred payout card spec** (all 4 concepts, sidebar):
- Background: `#F2F3F7`, border-radius: `rounded-xl`, padding: `p-6`
- Decorative lock icon: absolute, `text-[#ECEEF2]`, rotated 10°
- Title: `font-heading-secondary font-semibold text-lg text-[#0F1117]`
- Body: `text-sm text-[#0F1117]`
- Link: `text-sm font-semibold underline text-[#0F1117]` → "Read this article for more details"
- Footer: `text-sm text-gray-400` → "No deferred payout"

**Prototype chrome (left sidebar):**
- Collapsible aside: `bg-gray-950`, `w-72` expanded / `w-12` collapsed
- Zone 1 (header): Hub link (single chevron `M15 19l-7-7 7-7`), title, collapse/expand button (sidebar-panel SVG icon — rect + divider + chevron)
- Zone 2 (controls): concept 1–4 switcher pills, page switcher, `Before / After` text toggle + reset icon inline with "Concept" label
- Zone 3 (details): `bg-gray-900` — slightly lighter than `bg-gray-950` above to separate global controls from concept-specific content. Sections: **What's new** (bullets by page) → **Pros / Cons** (`+` green / `−` red) → **Success metric**

**Shell structure** (all 4 concepts share the same BM back-office shell):
- Header: `bg-gray-50 border-b border-gray-200` — BM logo + seller name + dropdowns
- Nav: `bg-gray-50 border-b border-gray-200` — 9 nav items, "Money" active
- Content: "Money" h1, sub-tabs (Your wallet / Past invoices / etc.), tab content

---

## Hub Page (`app/pages/index.vue`)

**Prototype interface:**
```ts
interface Prototype {
  title: string
  description: string
  author: string
  date: string
  status: 'In progress' | 'Ready for review' | 'Archived'
  tags: string[]
  link: string
}
```

**Status badge colours:**
- `In progress` → `bg-yellow-100 text-yellow-700`
- `Ready for review` → `bg-green-100 text-green-700`
- `Archived` → `bg-gray-100 text-gray-500`

To add a new prototype, add an entry to the `prototypes` array in `index.vue`.

---

## Revolve Design System

Full guidelines live at **`design-system/`** in this repo. Start with `design-system/Guidelines.md` for navigation, then load only the file relevant to the current task.

| Path | Contents |
|------|----------|
| `design-system/Guidelines.md` | Entry point — overview, critical rules |
| `design-system/foundations/` | Color, typography, spacing, radius, shadows, breakpoints tokens (JSON co-located) |
| `design-system/components/` | All `Rev*` components — props, variants, when to use |
| `design-system/composition/` | Multi-component layout patterns |
| `design-system/content/` | Voice, tone, microcopy rules |
| `design-system/icons/` | Icon catalog (`icons.json`) + usage guidance |
| `design-system/brand/` | Logo files and usage rules |

**Rules:**
- Never hardcode color, spacing, radius, or typography — always use a Revolve token
- Use semantic tokens (`background.*`, `text.*`, `border.*`) — never raw palette values
- All components use the `Rev` prefix — check `design-system/components/` before building anything new
- Mood is set at the container level and inherited — never override per-component
- For any new prototype, apply the same font setup: `font-heading-primary`, `font-heading-secondary`, `font-body`
- For icons: use `<RevIcon>` unless color inheritance is needed, in which case keep inline SVG

### Revolve components you can use in this repo

`app/components/rev/` holds local copies of the real Revolve components (styles copied from `@backmarket/design-system` 129.13.0). They are auto-imported, so use them directly instead of hand-styling buttons, tags, inputs and so on:

`RevButton`, `RevButtonIcon`, `RevButtonCard`, `RevCard`, `RevTag`, `RevLink`, `RevTabs` + `RevTabItem`, `RevDrawer`, `RevTable`, `RevInputText`, `RevInputSelect`, `RevToggle`, `RevRating`, `RevTooltip`, `RevList` + `RevListItemAction`, `RevDivider`, `RevSpinner`, `RevCountryFlag`, `RevIcon`.

- Each file starts with a short usage example. Props follow the docs in `design-system/components/`.
- `app/assets/css/revolve.css` has the real tokens as CSS variables (`var(--rev-bg-static-default-mid)`), one utility class per token (`rev-text-static-default-low`, `rev-border-static-default-mid`), the text styles (`rev-heading-1`, `rev-body-1`, `rev-caption`...) and the moods (`rev-mood-inverse`, `rev-mood-tangaroa`).
- Spacing: Revolve classes are in px (`p-24` = 24px). Here, use the normal Tailwind scale (`p-6` = 24px, `gap-2` = 8px).
- `app/components/bo/` holds Back Office pieces built from those: `BoShell` (header + main navigation), `BoPage` (title row) and `BoPill` (grade, battery, market pills).
- `deals-step-one` is the reference prototype for all of this. Older prototypes still use `BmShell` and hand-written styles.

---

## Vercel & MCP Setup

- **Vercel CLI account:** `andrewmalonebm` (`andrew.malone@backmarket.com`)
- **Deploy:** `vercel --prod` (project already linked in `.vercel/project.json`)
- **vercel-bm MCP server:** configured in `~/.claude.json` scoped to this project with Bearer token — available as `mcp__vercel-bm__*` tools in new sessions

---

## Key Decisions & Conventions

- `definePageMeta({ layout: false })` on all prototype pages — they manage their own full-page shell
- `v-show` (not `v-if`) for concept switching — keeps all 4 concepts mounted so tab state persists when switching
- `conceptTabs = ref([...])` — independent tab state array indexed by concept number
- No comments in code unless the why is non-obvious
- Always use Revolve tokens via Tailwind classes; never hardcode hex except where Tailwind doesn't have the exact token
- For new prototypes: use `font-heading-primary` (IvarSoft), `font-heading-secondary` (BMDupletDSP), `font-body` (BMDupletTXT) — never `font-display` (removed)
- Header and nav backgrounds match page background (`bg-gray-50`), not white
- `border-b border-gray-200` divider between header and nav must always be present

**Modal scoping (critical):**
- Outer wrapper: `relative overflow-hidden` — scopes modals to prototype area, never viewport
- Inner scroll: `absolute inset-0 overflow-y-auto` — the scrollable content
- Modals: `absolute inset-0 z-50` placed as siblings after the inner scroll div
- Never use `Teleport to="body"` or `position: fixed` for modals

**Sidebar sub-state system:**
- Each concept has a `cNActiveSubState` computed (not ref) that auto-tracks prototype state
- All four route through `currentSubStateId` computed + `onSetSubState` unified handler
- `watch(activeConcept)` closes all shared modals on concept switch to prevent state bleed
- `setActivePage` closes modals on top-level page nav + auto-switches C2 to 'Daily payout' tab
- Sub-state IDs must be unique within a concept's page, but can repeat across concepts (e.g. 'step-1' exists in C1/C2/C3/C4)
