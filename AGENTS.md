# Repository Guidelines

## Project Structure & Module Organization

- `site/`: VitePress content and app code.
  - `.vitepress/`: site config (`config.ts`), theme, and build output cache.
  - `src/`: Vue components, TypeScript helpers, and styles (`src/style/`).
  - `public/`: static assets copied as‑is.
  - Content folders: `guide/`, `dev/`, `extensions/`, `kb/`, etc.
- Root config: `package.json`, `tsconfig.json`, `biome.json`.
- Patches for dependencies: `patches/` (used by `patch-package`).
- Environment: `.env-template` (copy to `.env`) or run `./makeEnv`.

## Build, Test, and Development Commands

- `npm run docs:dev` — start local dev server with hot reload.
- `npm run docs:preview` — preview the production build locally.
- `npm run docs:build` — build the site (runs `docs:build-ci`).
- `npm run docs:build-ci` — apply `patch-package` then `vitepress build site`.
- Lint/format (Biome): `npx biome check .` and `npx biome format . --write`.

## Coding Style & Naming Conventions

- Formatting: Biome (2‑space indentation, organize imports). Do not commit
  unformatted code.
- Language: ESM (`"type": "module"`), TypeScript for helpers, Vue 3 SFCs.
- Naming: Vue components `PascalCase.vue` (e.g., `HomeFooter.vue`); TS helpers
  `lowerCamelCase.ts` (e.g., `getFlagEmoji.ts`); Markdown pages `kebab-case.md`
  where possible.
- Keep content in `site/`; avoid adding new root‑level toolchains unless
  discussed.

## Testing Guidelines

- No unit tests. Validate by building and previewing:
  - `npm run docs:build` then `npm run docs:preview`.
- Check changed pages load, links work, and console is clean.
- Prefer small PRs focused on one area (content vs. components).

## Commit & Pull Request Guidelines

- Commits: short, imperative, and scoped when helpful, e.g.:
  - `guide: clarify MAS migration steps`
  - `OpenInBrowser: add Quark`
- PRs: include summary, affected paths, screenshots for visual changes, and
  linked issues.
- Before opening: run Biome, build the site, and confirm preview renders.

## Security & Configuration

- Do not commit secrets. Use `.env` (see `.env-template`) and `./makeEnv`.
- `./makeEnv` relies on 1Password CLI secret injection; ensure `op` is installed
  and you are signed in (`op signin`). It runs
  `op inject -i .env-template -o .env`.
- If adding integrations, document required env vars and update `.env-template`.

## Agent‑Specific Notes

- This file applies to the entire repository. Follow these conventions for any
  edits and keep changes minimal, focused, and consistent with the existing
  style.
