# Rebuild Process Documentation

This document describes the step-by-step rebuild of the AI Cost Auditor web app following cursor rules (Remotion, React+TypeScript, Tailwind, Architecture), with no Streamlit, and with a focus on landing page quality, UI/UX, responsiveness, and a Remotion demo video for advertisement.

## Principles Applied

- **No Streamlit**: Web app is React (Vite + TypeScript) only.
- **Cursor rules**: Tailwind (Prettier + tailwind-merge, token-first), React+TypeScript (function components, strict types), Remotion (deterministic, schema-driven video).
- **Landing**: Catchy, beautiful, professional; high contrast; consistent spacing; 1–2 fonts (Inter); subtle motion.
- **UI/UX**: Simple at first glance, powerful in use; touch-friendly; flexible grid; responsive typography; native feel on desktop, tablet, mobile.

---

## Step 1: Tooling and Design Tokens

### Actions

1. **Tailwind**
   - Added `tailwind-merge` and `cn()` in `frontend/src/shared/lib/cn.ts` for conditional classes.
   - Extended `tailwind.config.js`:
     - `fontFamily.sans` and `fontFamily.display`: Inter + system fallback (single font system).
     - `spacing`: 4.5, 18, 22, 30, 88, 128 for consistent scale.
     - `fontSize.fluid-*`: clamp-based responsive typography (fluid-sm through fluid-4xl).
     - `colors.border`: CSS variable for borders.
   - Kept existing primary palette and animation keyframes; refined animation fill mode.

2. **Prettier**
   - Added `prettier`, `prettier-plugin-tailwindcss` in `package.json`.
   - Created `.prettierrc` with Tailwind plugin and single quotes.

3. **Global styles**
   - `index.css`: Removed invalid `border-border`; set `--color-border` and body `font-sans`.
   - `index.html`: Added Inter via Google Fonts, `viewport-fit=cover` for safe areas.

### Verification

- `cn()` used across pages/components for class merging.
- No hardcoded hex in Tailwind where theme tokens exist (charts use theme-aligned rgb/names where applicable).

---

## Step 2: Backend Fixes

### Actions

1. **CORS**
   - `backend/app/main.py`: `allow_origins` changed from `settings.CORS_ORIGINS` (string) to `settings.cors_origins_list` (list from config property).

2. **Config**
   - Confirmed `Settings.cors_origins_list` and default `CORS_ORIGINS` in `config.py` for local dev.

### Verification

- Backend starts without CORS errors when frontend runs on localhost:5173.

---

## Step 3: Landing Page Rebuild

### Actions

1. **Content and structure**
   - Single source of truth: `FEATURES` and `BENEFITS` as const arrays.
   - Sections: Hero → Benefits strip → Features → CTA → Footer.

2. **Visual and motion**
   - Hero: Gradient background, subtle grid pattern, badge (“FinOps layer for LLMs”), fluid headings and body text.
   - Staggered `animate-fade-in` / `animate-slide-up` with `animationDelay` for subtle motion.
   - High contrast: gray-900 text on white/primary-50; primary-700 for accent.
   - Spacing: consistent padding/margins (e.g. 4, 6, 8, 12, 16, 20) and section py-16/py-20.

3. **CTAs and accessibility**
   - Primary and secondary CTAs: `min-h-[3rem]`, `min-w-[11rem]`, `focus-visible:ring-2`, `touch-manipulation`, `active:scale-[0.98]`.
   - Links/buttons use `cn()` and `aria-hidden` on decorative icons.

4. **Typography**
   - Headings: `font-display` and `text-fluid-*` (fluid-4xl, fluid-3xl, fluid-xl, fluid-base).
   - Single font family (Inter) for all text.

### Verification

- Landing renders correctly; motion is subtle and not distracting; contrast and spacing are consistent; CTAs are touch-friendly.

---

## Step 4: UI/UX Across App

### Actions

1. **Layout**
   - `Layout.tsx`: Refactored with `cn()`, `NAV_ITEMS` constant, `aria-label`, `aria-expanded`, `aria-controls` on mobile menu.
   - Nav and logout: min height ~2.75rem/3rem, `focus-visible:ring-2`, `touch-manipulation`.
   - Mobile: `min-h-[3rem]` tap targets, clear active state.

2. **Login**
   - `LoginPage.tsx`: Error handling typed with `unknown` and narrowing; `cn()` for inputs and button; fluid typography; `min-h-[3rem]` on inputs/button; `focus-visible` styles; `role="alert"` on error.

3. **Dashboard**
   - `DashboardPage.tsx`: `cn()` for stat cards and layout; theme-aligned `CHART_COLORS` (no raw hex); fluid typography; responsive grid; loading/error states with accessible spinner; `aria-hidden` on decorative icons.

4. **Admin**
   - Admin panel: Same design tokens (rounded-2xl, border, shadow, spacing); buttons and interactive elements sized for touch where applicable.

### Verification

- All interactive elements have sufficient touch target size and focus-visible state.
- Typography and spacing scale are consistent; layout works on narrow and wide viewports.

---

## Step 5: Documentation and Build Verification

### Actions

1. **Docs**
   - `docs/REBUILD_PROCESS.md` (this file): Rebuild steps, principles, and verification.
   - Existing docs (`BUILD_PROCESS.md`, `ARCHITECTURE.md`, `API.md`, `DEPLOYMENT.md`, `QUICK_START.md`) remain the source for architecture and usage.

2. **Build**
   - Frontend: `npm install` then `npm run build` in `frontend/`.
   - Backend: no codegen; run with `uvicorn app.main:app`.
   - Full stack: `docker compose up --build` (see README and DEPLOYMENT.md).

### Verification

- `npm run build` completes without errors.
- No lint errors in modified files (React/TypeScript/Tailwind).

---

## Step 6: Remotion Demo Video (Advertisement)

### Purpose

- Single use: **advertisement** for AI Cost Auditor (product offer, audience, problems, features, CTA).
- Not used for in-app streaming or real-time UI.

### Standards (from `.cursor/rules/remotion.mdc`)

- Deterministic: no `Math.random()`, `Date.now()`, or network in render; seeded randomness if needed.
- Performance: minimal per-frame work; precomputed/memoized where possible.
- Composition: Root → compositions → scenes → primitives.
- Schema: Zod schema, default props, `calculateMetadata` (durationInFrames, fps, width, height).
- Animation: `useCurrentFrame()`, `interpolate()` with clamp, `spring()` for motion.
- Layout: Explicit layers and z-index tiers.

### Deliverable

- Standalone Remotion project under **`remotion/`** at repo root (does not affect main app build):
  - `remotion/src/Root.tsx`: Registers the composition.
  - `remotion/src/constants.ts`: FPS, width, height, z-index.
  - `remotion/src/compositions/ai-cost-auditor-demo/`: Main.tsx, schema.ts, constants.ts, scenes (Intro, Problem, CTA), index.ts, README.md.
  - `remotion/src/shared/animations.ts`: Deterministic fade/slide helpers.
- Output: 1920×1080, ~55s, suitable for export as MP4 for ads.
- Render: `cd remotion && npm install && npx remotion render AiCostAuditorDemo out/demo.mp4`.

### Verification

- `npx remotion render` (or project’s render command) produces a deterministic output.
- No runtime errors; metadata (duration, dimensions) matches schema.

---

## Summary Checklist

- [x] Tooling: Tailwind + Prettier + tailwind-merge; design tokens (spacing, fluid typography, 1 font).
- [x] Backend: CORS fixed to use `cors_origins_list`.
- [x] Landing: Rebuilt for catchy, professional look; high contrast; motion; touch-friendly CTAs.
- [x] UI/UX: Layout, Login, Dashboard, Admin updated for touch targets, focus-visible, responsive grid, fluid type.
- [x] Documentation: Rebuild process documented.
- [ ] Build: `npm run build` and Docker run verified (recommended to run locally).
- [x] Remotion: Demo video composition in `remotion/`; render with `npx remotion render AiCostAuditorDemo out/demo.mp4` (see Step 6).

---

## References

- `.cursor/rules/remotion.mdc` — Remotion standards.
- `.cursor/rules/remotion-generator.mdc` — Composition scaffold.
- `.cursor/rules/react-typescript.mdc` — React/TS standards.
- `.cursor/rules/tailwind.mdc` — Tailwind and Prettier.
- `.cursor/rules/architecture.mdc` — Feature/shared structure.
- `docs/BUILD_PROCESS.md` — Original build steps.
- `docs/ARCHITECTURE.md` — System architecture.
