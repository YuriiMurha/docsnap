
# DocSnap — implementation plan

A mobile-first web app where a clerk uploads two photos (delivery note + pallet) and gets a traffic-light match report. Slovak UI. Demo data works without any photos so it's testable today, before the OpenRouter key arrives.

## Scope for this build

In:
- 3 screens with full navigation, working demo flow end-to-end
- Design tokens (teal/red/amber/green), Georgia brand font, max-width 480px shell
- OpenRouter vision integration scaffolded and ready — flips on as soon as the key is added
- Pure-JS match algorithm + statuses OK / MISSING / EXTRA / PARTIAL
- Mocked AI path used by the "Vyskúšaj s ukážkovými dátami" link

Out (per PRD):
- No auth, no WMS, no history list, no settings
- No real "report discrepancy" — just a toast

Skipping Supabase persistence for now. The PRD explicitly says "Backend: none" and you flagged it as optional. Nothing on the 3 screens needs a DB — state lives in a React context while the user is on the delivery. If you want history later we can add it in one short follow-up.

## Screens

1. `/` Capture — two upload cards (file input with `capture="environment"`), primary CTA disabled until both photos are picked, demo-data link below, full-screen loading overlay with sequential Slovak status text on submit.
2. `/match` Report — summary headline "X z Y sedí", 3 colored pill counters, [Všetko]/[Iba problémy] filter chips, scrollable rows with status dot + name + SKU + "{detected}/{ordered} ks", sticky "Podpísať príjem" button (toast).
3. `/match/$sku` Detail — colored status banner, "Z dodacieho listu" + "Detegované na palete" + pallet thumbnail, "Nahlásiť rozdiel dodávateľovi" CTA (toast).

## Technical notes

Stack adaptation: project is on TanStack Start, not plain React Router. Routing will use file-based routes in `src/routes/` instead of `react-router-dom`. Functionally identical to the PRD.

OpenRouter call placement: rather than calling OpenRouter from the browser with `VITE_OPENROUTER_API_KEY` (PRD's option, acceptable for a workshop but exposes the key in the bundle), I'll put the vision call in a TanStack `createServerFn`. The client sends base64 → the server function adds `Authorization: Bearer $OPENROUTER_API_KEY` from a runtime secret and proxies to OpenRouter. Same UX, key stays server-side. When you're ready, you'll paste the key into the secrets dialog as `OPENROUTER_API_KEY` (+ optional `OPENROUTER_MODEL`, default `anthropic/claude-sonnet-4`).

Files I'll create:

```text
src/types.ts                          LineItem, DetectedItem, MatchRow, Delivery
src/lib/match.ts                      buildMatchReport()
src/lib/demo.ts                       DEMO_DELIVERY (5 items, OK/PARTIAL/MISSING/EXTRA mix)
src/lib/file-to-base64.ts             helper
src/lib/ai.functions.ts               extractDeliveryNote + detectPalletContents server fns
src/context/delivery-context.tsx      single context with active Delivery
src/components/upload-card.tsx        camera-icon upload tile
src/components/status-dot.tsx
src/components/loading-overlay.tsx    sequential Slovak status text
src/routes/index.tsx                  Capture screen (replaces placeholder)
src/routes/match.tsx                  Match Report
src/routes/match.$sku.tsx             Detail
public/demo/lieferschein-sample.jpg   placeholder (1x1 or simple SVG until you supply one)
public/demo/pallet-sample.jpg         same
```

Design tokens added to `src/styles.css` as oklch equivalents of the PRD palette and exposed under semantic names (`--brand`, `--status-ok`, `--status-missing`, `--status-extra`, `--status-partial`, etc.) so components use Tailwind utilities like `bg-brand text-status-missing` — no hardcoded hex in JSX.

Mocked AI today: server functions short-circuit and return `DEMO_DELIVERY`'s arrays after a 1s delay until `OPENROUTER_API_KEY` is present. That means the full upload flow is testable in a mobile browser right now with any two image files; the demo-data link bypasses uploads entirely.

## What's left for after this build

- Add `OPENROUTER_API_KEY` secret → vision calls go live, no code change.
- Drop real Lieferschein + pallet sample images into `public/demo/`.
- Optional: enable Lovable Cloud and persist deliveries to a `deliveries` table if you want a history view.

Once you approve, I'll implement, then you can open the preview URL on your phone to test.
