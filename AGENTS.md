# Repository Guidelines

## Build, Test, and Development Commands

- Use `npm`/`npx` for running project commands.
- `npm run docs:dev` — start local dev server with hot reload.
- `npm run docs:preview` — preview the production build locally.
- `npm run docs:build` — build the site (runs `docs:build-ci`).
- `npm run docs:build-ci` — apply `patch-package` then `vitepress build site`.
- Lint/format (Biome): `npx biome check .` and `npx biome format . --write`.
