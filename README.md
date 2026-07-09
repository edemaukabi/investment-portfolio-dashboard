# Investment Portfolio Dashboard

A responsive portfolio dashboard built with React and TypeScript for the Trove Frontend Engineer assessment. It has a simulated sign in and a single dashboard view that shows net worth, a sector allocation breakdown, per sector account summaries, holdings, and transactions. Everything is served through a small service layer that fakes an async API over the provided JSON.

> **Live demo:** https://investment-portfolio-dashboard-kappa.vercel.app

## Tech stack

- **React 18** with **TypeScript** in strict mode
- **Vite** for the dev server and build
- **React Router** for routing and the protected dashboard route
- **Recharts** for the two charts (the net worth line and the allocation bar)
- **CSS Modules** for styling, with no UI component library

## Getting started

```bash
npm install
npm run dev      # serves at http://localhost:5173
```

```bash
npm run build    # type-checks, then builds to dist/
npm run preview  # serves the production build
```

Sign in with any valid email and a password that meets the rules shown on the form (at least 8 characters, upper and lower case, and a number). Authentication is simulated, as the brief allows, but the validation, strength meter, button loading state, and session persistence are all real. For a quick start, you can use `adaeze@trovefinance.com` / `Trove2025`.

## Architecture

### Folder layout

The code is organised by feature rather than by file type, so everything the dashboard needs sits together and only the genuinely shared pieces move up into `components/` or `lib/`.

```
src/
  components/   reusable UI: badges, pills, search, skeleton, avatar, icons, dialog
  data/         the provided JSON, imported only by the service layer
  features/
    auth/       AuthContext and the login screen
    dashboard/  the page shell and its dashboard-specific components
  lib/          pure functions: formatters, portfolio math, chart series, search
  services/     the simulated async API over the JSON
  styles/       design tokens (the Trove v3 palette) and the global reset
  types.ts      the raw API payload contract
```

### How data moves through the app

```
portfolio.json  ->  portfolioService (async + latency)  ->  usePortfolio hook
                ->  derivePortfolio() (pure math)        ->  components (presentation only)
```

Components never import the JSON. They ask the service for it, and every derived number comes out of pure functions in `lib/portfolio.ts`, which keeps the business rules in one place that is easy to test.

- `services/portfolioService.ts` wraps the JSON in a promise with a realistic delay, deep clones the payload so nothing can mutate the source, and exposes a `FAILURE_RATE` knob for exercising the error and retry states.
- `usePortfolio` surfaces `loading`, `error`, and `ready` states plus a `retry`. The dashboard shows a skeleton, an error card with a retry button, or the real content.
- `derivePortfolio` enriches each holding (market value, cost basis, gain or loss, and a status flag) and computes net worth, the overall return, and the sector grouping that feeds both the allocation bar and the account cards.

The enriched holding is a discriminated union on `status` (`active`, `price-unavailable`, `closed`). Valuation fields are typed as `number` on the active variant and `null` on the others, so the compiler rejects any code that tries to read a gain or loss off NVDA or DIS. The data quirks are enforced by the type system, not just by discipline.

### State management

The app has two pieces of genuinely shared state: the auth session and a single portfolio fetch. Reaching for Redux here would add a store, boilerplate, and indirection without solving a problem the app actually has, so I kept it lean.

- The **auth session** lives in a small `AuthContext`, persisted to `sessionStorage` so a refresh doesn't sign you out.
- **Server data** comes from the `usePortfolio` hook. It's fetched once by the dashboard and passed down a single level as props.
- **UI state** (active tab, search text, filter pills, chart range, hide balances, the mobile drawer) stays local to whichever component owns it.

Everything already flows through the service layer, so scaling this later is a small change rather than a rewrite. The "What I'd improve" section covers where Redux or TanStack Query would earn their place.

### Styling and responsiveness

Styling is plain CSS Modules over a token sheet (`styles/tokens.css`) that holds the Trove v3 palette, radii, and shadows as custom properties. There's no utility framework and no component library. The colours are the sixteen palette values reproduced exactly, and the type follows the spec's roles: the net worth value at 27px semi-bold, card values at 14px medium, and labels and captions at 11 to 12px in the neutral and disabled greys.

The layout is verified down to 320px. The sidebar becomes an off-canvas drawer below 880px, the top bar search collapses into a full-width overlay below 768px, the overview grid stacks below 1024px, and spacing tightens again below 640 and 380px. Value columns are sized to their content so figures never clip on a narrow screen; the company name truncates first instead.

## Notable decisions

A handful of choices that went past the checklist:

- **Hiding balances hides all of them.** The toggle masks the headline figure, the account cards, holding values, order amounts, the excluded holding footnote, and the chart tooltips on hover. A privacy control that leaks the exact number when you mouse over the chart isn't really a privacy control. Percentages stay visible, since those describe composition rather than wealth.
- **The range selector actually changes the number.** Picking 1D, 1W, or 1M shows the move across that window, while ALL shows the true return against the amount invested. The headline percentage and the chart always tell the same story, so a rising line never sits next to a red figure.
- **Ordering is deliberate.** Holdings list the largest position first and push the unpriced (NVDA) and closed (DIS) entries to the end. Transactions sort newest first rather than trusting the order in the file.
- **The top bar search is a quick search.** Typing opens a dropdown that searches holdings and transactions together, with arrow key and Enter navigation. Each result is tagged with where it lives (a green Stock pill or an amber Order pill), and choosing one jumps to the right tab and briefly pulses the matching card or row into view. The in-card "Search by ticker or company name" is a separate live filter for the list itself. If a company matches in both tabs, the dropdown lists the two hits as separate labelled rows rather than merging them, so a selection is never ambiguous.
- **Upcoming features especially for CTA areas are honest.** The nav items that aren't part of the demo, along with Add Funds and the bell, open a small "Coming soon" dialog instead of doing nothing, and the nav items reveal that on hover rather than wearing a permanent badge. One accessible dialog (focus managed, closes on Escape or an outside click) serves the whole app.
- **The allocation bar is a Recharts stacked bar,** since the brief invites a charting library for it. Recharts shares one tooltip across a single category stacked bar and can't report which segment the pointer is on, so I track the hovered segment through each bar's `onMouseEnter` and render my own tooltip. Hovering a segment shows that sector's value and share and dims the rest, in step with the legend. Recharts also powers the net worth line.
- **Performance.** The dashboard is a lazy route, so the login screen never downloads Recharts (roughly 104 KB gzipped) and ships only React and its own code.
- **Small things that add up.** The sidebar shows the member's photo with an automatic initials fallback if it fails to load, Escape closes the mobile drawer and locks the background scroll, filter changes are announced to screen readers, animations respect `prefers-reduced-motion`, tooltips are pure CSS though this could be done easily with a library but I tried to keep to the rules of the brief, and each screen sets its own document title.

## Handling the data quirks

The dataset ships with a few deliberate traps. Here's how each one is handled.

1. **NVDA has a `currentPrice` of 0.** A zero price for NVIDIA is a missing quote, not a real value. Booking it at $0 would quietly turn a $4,100 cost basis into a 100 percent loss, so the position is flagged `price-unavailable`: the card reads "Not priced" with a badge and an explaining tooltip, it adds nothing to net worth or allocation, and the net worth card carries a footnote that spells out exactly what was left out (ticker, shares, and the amount invested) so the total is never silently wrong.
2. **DIS has 0 shares.** Zero shares means a closed position, not an active holding. It's left out of net worth, allocation, and the sector counts, but still shown in the Stocks tab, dimmed and valued at $0.00 with a "No open position" badge, because hiding it outright would make the list look inconsistent with the data. I also left it there but dimmed for historical data purposes.
3. and 4. **A PENDING and a FAILED transaction.** Each status gets its own badge colour (green, amber, red). A pending amount is muted because the cash hasn't settled, and a failed amount is struck through and faded because the money never moved and shouldn't read like a real debit or credit.
5. **Negative returns.** Losses always carry an explicit minus sign on both the amount and the percentage, for example `-$161.00 (-6.1%)`, in the palette's loss red, while gains get a plus sign in green. The rule is applied everywhere through shared formatters in `lib/formatters.ts`.

One more thing I noticed: `summary.totalPortfolioValue` ($48,250.75) doesn't match the value computed from the holdings (about $19,134). The brief says net worth is computed from all holdings, so I compute and show that figure and leave the `summary` block unused. It turns out $48,250.75 is the number from the wireframe, whose account cards (US Portfolio, NG Portfolio, Fixed Income, GEMS) cover accounts the holdings array never lists. Mixing that account level total, or the $42,000 invested figure, with the $19k of holdings we can actually see would produce a nonsense return of around minus 54 percent, so gain and loss come from each holding's own `avgCost` instead.

Because the dataset has no price history, the net worth line plots a deterministic seeded series that always lands on the real current value, purely for visual context. See `lib/performance.ts`.

## What I'd improve with more time

- **Tests.** Unit tests for `derivePortfolio` and the formatters, since the quirky holdings are exactly the cases worth pinning down, plus a few React Testing Library flows for login validation and the filters.
- **Runtime validation** at the service boundary with something like Zod. The JSON is currently trusted through a type cast, which is fine for a local fixture but not for a real API.
- **State management as it scales.** Context is the right tool at this size. If the app grew to many screens sharing server data, with mutations and cache invalidation, I'd bring in TanStack Query for the server side. And if client state grew into a lot of cross cutting concerns, think a rich filter and watchlist system, optimistic trade flows, or cross tab sync, a dedicated store such as Redux Toolkit (or a lighter option like Zustand) would earn its place. The service layer already draws the seam those tools would slot into.
- **Accessibility polish.** I added good accessibility features in this current iteration, but a full focus trap in the mobile drawer and wider `aria-live` coverage for result counts would be a good addition.
- **Shareable views.** Put the active tab and filters in the URL so a view can be linked and restored.
- **Currency awareness.** Each holding carries a `currency` field. Formatting currently assumes USD, which holds for this dataset but wouldn't for a mixed one.
