# Repository Guidelines

## Build, Test, and Development Commands

- Use `bun`/`bunx` for running project commands.
- `bun run docs:dev` — start local dev server with hot reload.
- `bun run docs:preview` — preview the production build locally.
- `bun run docs:build` — build the site (runs `docs:build-ci`).
- `bun run docs:build-ci` — apply `patch-package` then `vitepress build site`.
- Lint/format (Biome): `bunx biome check .` and `bunx biome format . --write`.
