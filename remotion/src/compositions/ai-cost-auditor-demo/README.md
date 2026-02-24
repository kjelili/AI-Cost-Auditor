# AI Cost Auditor Demo (Advertisement Video)

Promotional video composition for **AI Cost Auditor** — advertisement only (no in-app streaming).

## Specs

- **Resolution**: 1920×1080
- **FPS**: 30
- **Duration**: ~55 seconds (Intro → Problem → CTA)
- **Deterministic**: No `Math.random()` or network in render; props-driven only.

## Props (Zod schema)

- `title` (string): Product name, default `"AI Cost Auditor"`.
- `tagline` (string): Tagline, default `"The AWS Cost Explorer for LLMs"`.

## Render

From project root (where `remotion/package.json` lives):

```bash
cd remotion
npm install
npx remotion render AiCostAuditorDemo out/demo.mp4
```

Optional: preview in Remotion Studio:

```bash
npx remotion studio
```

## Structure

- `Main.tsx` — composition entry; sequences for Intro, Problem, CTA.
- `schema.ts` — Zod schema, default props, `calculateMetadata`.
- `constants.ts` — fps, dimensions, scene durations, z-index.
- `scenes/` — Intro, Problem, CTA (deterministic, frame-based animation).
- `../shared/animations.ts` — `fadeIn`, `fadeOut`, `slideUp` (interpolate + clamp).

## Cursor rules

- `.cursor/rules/remotion.mdc` — determinism, performance, schema, layering.
- `.cursor/rules/remotion-generator.mdc` — composition scaffold.
