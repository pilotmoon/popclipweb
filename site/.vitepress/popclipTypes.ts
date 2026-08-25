import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import type { Plugin } from "vite";

// PopClip's JavaScript API type definitions ship as the @popclip/types npm
// package, which this site already depends on. The file is self-contained --
// runtime API, module types, config format and environment, with its own
// version header -- so it is published here verbatim. Reading it out of
// node_modules means the served copy cannot drift from the version the
// surrounding documentation is written against.

const require = createRequire(import.meta.url);

// Public URL path, and the file name a reader would want to save it as.
export const POPCLIP_TYPES_PATH = "/dev/popclip.d.ts";

/** The published definitions, exactly as packaged. */
export function popclipTypesSource(): string {
  return readFileSync(require.resolve("@popclip/types/popclip.d.ts"), "utf8");
}

/** Write the definitions into a finished build. Call from `buildEnd`. */
export function writePopClipTypes(outDir: string): void {
  const destination = path.join(outDir, POPCLIP_TYPES_PATH);
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, popclipTypesSource());
}

/**
 * Serve the definitions from the dev server too, so the docs links work in
 * `docs:dev` and not only in a built site.
 */
export function popclipTypesPlugin(): Plugin {
  return {
    name: "popclip-types",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split("?")[0] !== POPCLIP_TYPES_PATH) {
          return next();
        }
        // Plain text, so it displays in a browser rather than downloading.
        // The deployed server's mime.types maps .ts the same way.
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end(popclipTypesSource());
      });
    },
  };
}
