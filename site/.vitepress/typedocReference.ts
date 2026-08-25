import path from "node:path";
import { Application } from "typedoc";
import type { Plugin } from "vite";

// The HTML "JavaScript API Reference", generated from the installed
// @popclip/types at build time and served at /dev/api/. Generating it
// here, from the same installed package that /dev/popclip.d.ts is served
// from, keeps the reference, the raw definitions, and the prose docs on one
// version. (Formerly built inside the popclip-types repo and hosted on
// GitHub Pages, now retired.)

export const TYPEDOC_REFERENCE_PATH = "/dev/api";

export async function writeTypedocReference(outDir: string): Promise<void> {
  // The literal node_modules path, not require.resolve: a file: install
  // symlinks the package, and the resolved realpath would fall outside the
  // tsconfig's include.
  const entry = path.resolve(
    import.meta.dirname,
    "../../node_modules/@popclip/types/popclip.d.ts",
  );
  const app = await Application.bootstrap({
    entryPoints: [entry],
    name: "PopClip JavaScript API Reference",
    disableSources: true,
    sort: ["alphabetical"],
    // The entry point lives in node_modules, which typedoc's default
    // externalPattern matches -- and the theme's "Externals" visibility
    // filter defaults to hidden, which would blank the whole reference. An
    // empty pattern means nothing is classified external at all.
    externalPattern: [],
    excludeExternals: false,
    excludeNotDocumented: true,
    readme: path.join(import.meta.dirname, "typedocHome.md"),
    tsconfig: path.join(import.meta.dirname, "typedoc.tsconfig.json"),
    logLevel: "Warn",
  });
  const project = await app.convert();
  if (!project) {
    throw new Error("typedoc: conversion failed");
  }
  app.validate(project);
  if (app.logger.hasErrors() || app.logger.hasWarnings()) {
    throw new Error("typedoc: reported warnings or errors");
  }
  await app.generateDocs(
    project,
    path.join(outDir, TYPEDOC_REFERENCE_PATH.slice(1)),
  );
}

/**
 * Serve the reference from the dev server too. The pages are generated once
 * per server start, into the VitePress cache directory; requests arriving
 * before generation finishes wait for it.
 */
export function typedocReferencePlugin(): Plugin {
  const cacheDir = path.join(import.meta.dirname, "cache", "typedoc-api");
  let generated: Promise<void> | undefined;
  const types: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".json": "application/json",
  };
  return {
    name: "typedoc-reference",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url ?? "").split("?")[0];
        if (url !== TYPEDOC_REFERENCE_PATH && !url.startsWith(`${TYPEDOC_REFERENCE_PATH}/`)) {
          return next();
        }
        generated ??= (async () => {
          const { rm } = await import("node:fs/promises");
          await rm(cacheDir, { recursive: true, force: true });
          // writeTypedocReference appends /dev/api to the dir it is given
          const fakeOut = path.join(import.meta.dirname, "cache", "typedoc-root");
          await rm(fakeOut, { recursive: true, force: true });
          await writeTypedocReference(fakeOut);
          const { rename, mkdir } = await import("node:fs/promises");
          await mkdir(path.dirname(cacheDir), { recursive: true });
          await rename(path.join(fakeOut, "dev", "api"), cacheDir);
          await rm(fakeOut, { recursive: true, force: true });
        })();
        await generated;
        let rel = url.slice(TYPEDOC_REFERENCE_PATH.length).replace(/^\//, "");
        if (rel === "") {
          rel = "index.html";
        }
        const file = path.join(cacheDir, rel);
        // guard against path traversal
        if (!file.startsWith(cacheDir + path.sep)) {
          return next();
        }
        const { readFile } = await import("node:fs/promises");
        try {
          const body = await readFile(file);
          res.setHeader(
            "Content-Type",
            types[path.extname(file)] ?? "application/octet-stream",
          );
          res.end(body);
        } catch {
          res.statusCode = 404;
          res.end("not found");
        }
      });
    },
  };
}
