# Tangle

A mobile-first **Untangle / Planarity** puzzle. Drag vertices to remove every edge crossing. 100 deterministic procedural levels, star ratings, no timer.

Built on Phaser 4 + React 19 + Capacitor 8.

## Getting started

```bash
npm install
npm run dev
```

Open the URL Vite prints.

To regenerate the 100 bundled levels (only needed if you change the generator):

```bash
npm run generate-levels
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server on :8080 |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run test` | Unit tests (vitest) |
| `npm run test:cov` | Unit tests with coverage |
| `npm run test:e2e` | Playwright E2E smoke test |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run generate-levels` | Regenerate `src/game/domain/levels.generated.ts` |
| `npm run cap:sync` | Build + `npx cap sync` |
| `npm run cap:open:ios` | Open Xcode |
| `npm run cap:open:android` | Open Android Studio |

## Architecture

See `CLAUDE.md` for the per-folder responsibility map and layering rules.
