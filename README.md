# Solar für unser Haus — Hobrechtstraße 28

Interactive calculator for the WEG (homeowners' association) at Hobrechtstraße 28, 12047 Berlin-Neukölln, exploring trade-offs around a rooftop solar PV + battery installation.

**Live:** _(add URL after deploy)_

## What it does

A single-page calculator where sliders and toggles on the left drive live-updating numbers on the right. Covers four key trade-offs:

1. **System size** (30–45 kWp) and whether to include the Berlin SolarPLUS subsidy
2. **Supply model** — Full feed-in, §42b Kundenanlage, or §42c Energy Sharing (from June 2026)
3. **Battery storage** (0–40 kWh)
4. **Financing** — KfW loan, one-time levy (Sonderumlage), or contracting via an external operator

Four quick-start presets (Conservative / Recommended / Max returns / Zero risk) anchor the discussion, and the hero banner shows the 25-year profit per apartment plus net monthly cash flow.

Bilingual: DE / EN toggle in the top right.

## Figures & assumptions

All numbers come from the feasibility study for the building (Berlin solar yield ~950 kWh/kWp/yr, 0% VAT since 2023, feed-in tariffs fixed 20 years, inverter replacement in year 15). Subsidy estimates are conservative. **Get professional quotes before any WEG resolution.**

## Running locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Stack

React + Vite + TypeScript, Tailwind v4, shadcn/ui, DM Sans / DM Mono.
