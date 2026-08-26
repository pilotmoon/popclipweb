import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import siteConfig from "../src/config/config.json";
import {
  ALL_MD_PATH,
  LLMS_FULL_PATH,
  LLMS_TXT_PATH,
  type LlmPage,
  llmFilePaths,
  llmPages,
  llmSections,
  siteRoot,
} from "./llmPages.ts";

// Plain-Markdown twins of the documentation pages, for LLM (and human)
// consumption, generated from the same sources VitePress renders. Each page
// in llmPages.ts is cleaned of VitePress- and Vue-specific constructs and
// served at its source path (e.g. /dev/actions.md beside /dev/actions).
// From the same cleaned pages, three composite files are generated:
//
//   /dev/all.md      -- the extension-authoring corpus: every Developer
//                       Reference page in one file
//   /llms-full.txt   -- dev + guide + kb: everything about PopClip
//   /llms.txt        -- the llmstxt.org index of all of the above
//
// Like the typedoc reference, everything is generated at build time by
// writeLlmDocs (called from buildEnd) and by a dev-server middleware, so
// the URLs work under docs:dev too.

// Not import.meta.dirname: this module is in the type-checked program (via
// dev/[onepage].paths.ts), and the installed @types/node predates it.
const siteDir = fileURLToPath(new URL("..", import.meta.url));

// ---------------------------------------------------------------------------
// Current release version, for substituting <PopClipVersion /> tags. Fetched
// once per process from the same source as the releases data loader; if the
// fetch fails (offline dev), generic wording is substituted instead.

let versionsPromise: Promise<{ display: string; build: string }> | undefined;
function popclipVersions() {
  versionsPromise ??= fetch("https://pilotmoon.com/meta/popclip-releases.json")
    .then((response) => response.json())
    .then(
      (releases: { versionString: string; version?: number | null }[]) => ({
        display: releases[0].versionString,
        build: String(releases[0].version ?? "current"),
      }),
      () => ({ display: "the current version", build: "current" }),
    );
  return versionsPromise;
}

// ---------------------------------------------------------------------------
// Page-specific patches: exact-match replacements applied to the source
// before general cleaning, for spots where mechanical rules can't produce
// sensible text (component-driven passages).

const pagePatches: Record<string, [string, string][]> = {
  "dev/icons.md": [
    [
      "<IconExplorer />",
      "_(An interactive icon preview tool is available in the [online version" +
        " of this page](https://www.popclip.app/dev/icons).)_",
    ],
  ],
  "kb/notes.md": [
    // The supported/unsupported browser lists are rendered from directory
    // data; the preceding paragraph already points at the browser support
    // table, which carries the same information.
    [
      `✅ Website exclusion works in the following browsers:

<i>
<PageInfoBrowserList />
</i>

❌ The following browsers are **not supported**:

<i>
<PageInfoBrowserList unsupported/>
</i>`,
      "",
    ],
  ],
  "extensions/submit.md": [
    // Breadcrumb navigation div.
    [
      `<div style="color: var(--vp-c-text-2); margin-bottom: 32px;">
<a href="/extensions/" style="text-decoration: none;">PopClip Extensions Directory</a> / Submit an Extension
</div>`,
      "",
    ],
  ],
};

// ---------------------------------------------------------------------------
// Inline helpers

// Emoji shortcodes that VitePress's markdown-it-emoji renders. Only the ones
// actually used in the docs; unknown shortcodes are left alone (strings like
// `iconify:mdi:home` live in code spans anyway).
const emojiMap: Record<string, string> = {
  robot: "🤖",
  thinking: "🤔",
  bulb: "💡",
  turtle: "🐢",
  eyes: "👀",
  wave: "👋",
  speech_balloon: "💬",
  man_juggling: "🤹‍♂️",
  handshake: "🤝",
  earth_africa: "🌍",
};

// HTML entities used in the docs to sidestep markdown-it parsing; the twins
// want the literal characters.
const entityMap: Record<string, string> = {
  "&#32;": " ",
  "&#x0020;": " ",
  "&#x00A0;": " ",
  "&nbsp;": " ",
  "&ensp;": " ",
  "&#47;": "/",
  "&#58;": ":",
  "&period;": ".",
  "&reg;": "®",
};

// Split a line into code spans and plain text, so transforms never touch the
// inside of `backticked` code. Handles multi-backtick delimiters.
function splitCodeSpans(line: string): { text: string; isCode: boolean }[] {
  const parts: { text: string; isCode: boolean }[] = [];
  let rest = line;
  const opener = /`+/;
  for (;;) {
    const open = opener.exec(rest);
    if (!open) {
      break;
    }
    const closeIndex = rest.indexOf(open[0], open.index + open[0].length);
    if (closeIndex === -1) {
      break;
    }
    const end = closeIndex + open[0].length;
    if (open.index > 0) {
      parts.push({ text: rest.slice(0, open.index), isCode: false });
    }
    parts.push({ text: rest.slice(open.index, end), isCode: true });
    rest = rest.slice(end);
  }
  if (rest.length > 0 || parts.length === 0) {
    parts.push({ text: rest, isCode: false });
  }
  return parts;
}

function mapOutsideCode(line: string, fn: (text: string) => string): string {
  return splitCodeSpans(line)
    .map((part) => (part.isCode ? part.text : fn(part.text)))
    .join("");
}

// Find the next Vue component tag (capitalized name) in a line, respecting
// quoted attribute values, which can contain ">" (e.g. embedded SVG source).
interface ComponentTag {
  name: string;
  start: number;
  end: number;
  attrs: string;
  selfClosing: boolean;
}

function findComponentTag(text: string, from: number): ComponentTag | null {
  const open = /<([A-Z][A-Za-z0-9]*)(?=[\s/>])/g;
  open.lastIndex = from;
  const match = open.exec(text);
  if (!match) {
    return null;
  }
  let quote = "";
  for (let i = open.lastIndex; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === quote) {
        quote = "";
      }
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === ">") {
      const attrs = text.slice(open.lastIndex, i);
      return {
        name: match[1],
        start: match.index,
        end: i + 1,
        attrs,
        selfClosing: attrs.trimEnd().endsWith("/"),
      };
    }
  }
  return null;
}

// Display text for GitHub links, matching AaLink.vue: the path within
// github.com, with any branch/commit segment elided.
function githubDisplay(href: string): string {
  if (href.startsWith("https://github.com/")) {
    return href
      .replace(/^https:\/\/github.com\//, "")
      .replace(/tree\/[A-Za-z0-9._-]+\//, ".../");
  }
  return href;
}

function resolveCfg(cfg: string): string {
  if (cfg === "mas.storeUrl") {
    return `https://apps.apple.com/app/${siteConfig.mas.slug}/id${siteConfig.mas.appId}`;
  }
  let value: unknown = siteConfig;
  for (const key of cfg.split(".")) {
    value = (value as Record<string, unknown>)?.[key];
  }
  if (typeof value !== "string") {
    throw new Error(`llmDocs: cannot resolve AaLink cfg "${cfg}"`);
  }
  return value;
}

interface CleanContext {
  file: string;
  versions: { display: string; build: string };
  // "twin": plain Markdown for direct serving -- everything VitePress-
  // specific is converted away. "page": Markdown destined to be rendered by
  // VitePress itself (the /dev/all one-pager), so containers, code groups,
  // Shiki markers, emoji, entities and relative links all stay; only the
  // things that cannot work outside their own page -- frontmatter, script/
  // style blocks and Vue components -- are removed.
  mode: "twin" | "page";
}

// Replace or remove the Vue components used in doc pages. Throws on any
// component this cleaner doesn't know, so a future edit can't silently ship
// raw tags in the twins.
function replaceComponents(text: string, ctx: CleanContext): string {
  let result = text;
  for (let guard = 0; guard < 100; guard++) {
    const tag = findComponentTag(result, 0);
    if (!tag) {
      return result;
    }
    let replacement: string;
    let end = tag.end;
    const inner = () => {
      const close = `</${tag.name}>`;
      const closeIndex = result.indexOf(close, tag.end);
      if (closeIndex === -1) {
        throw new Error(
          `llmDocs: unclosed <${tag.name}> in ${ctx.file}: ${text.trim()}`,
        );
      }
      end = closeIndex + close.length;
      return result.slice(tag.end, closeIndex);
    };
    switch (tag.name) {
      case "Icon":
      case "InlineIcon":
      case "StatusIconInline":
      case "InfoBox":
      case "NewsBox":
        replacement = "";
        break;
      case "SetappInline":
        replacement = tag.selfClosing ? "" : inner();
        break;
      case "DirectoryCount":
        replacement = "hundreds of";
        break;
      case "PopClipVersion":
        replacement = /\bbuild\b/.test(tag.attrs)
          ? ctx.versions.build
          : ctx.versions.display;
        break;
      case "SupportEmailLink":
        replacement = "[support@pilotmoon.com](mailto:support@pilotmoon.com)";
        break;
      case "AaLink": {
        const href = /href="([^"]*)"/.exec(tag.attrs)?.[1];
        const cfg = /cfg="([^"]*)"/.exec(tag.attrs)?.[1];
        const url = href ?? (cfg ? resolveCfg(cfg) : undefined);
        if (!url) {
          throw new Error(`llmDocs: AaLink without href/cfg in ${ctx.file}`);
        }
        const label = tag.selfClosing ? githubDisplay(url) : inner();
        replacement = `[${label}](${url})`;
        break;
      }
      default:
        throw new Error(
          `llmDocs: unhandled component <${tag.name}> in ${ctx.file}: ${text.trim()}`,
        );
    }
    result = result.slice(0, tag.start) + replacement + result.slice(end);
  }
  throw new Error(`llmDocs: runaway component replacement in ${ctx.file}`);
}

// Rewrite link and image targets to absolute URLs, pointing internal doc
// links at the .md twins where they exist.
const twinRoutes = new Map<string, string>();
for (const page of llmPages) {
  const twinPath = `/${page.file}`;
  const route = twinPath.replace(/\.md$/, "");
  twinRoutes.set(route, twinPath);
  if (route.endsWith("/index")) {
    const dir = route.slice(0, -"index".length);
    twinRoutes.set(dir, twinPath);
    twinRoutes.set(dir.replace(/\/$/, ""), twinPath);
  }
}

// Images referenced by the current generation run. VitePress bundles page
// images into hashed asset paths, so the source-path URLs the twins use only
// work if the files are also copied into the dist (writeLlmDocs does this).
const referencedMedia = new Set<string>();

function resolveTarget(target: string, pageDir: string, isImage: boolean) {
  if (target.startsWith(`${siteRoot}/`)) {
    // a few pages link to this site absolutely; treat as internal
    target = target.slice(siteRoot.length);
  } else if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("//")) {
    return target; // external (https:, mailto:, ...)
  }
  if (target.startsWith("#")) {
    return target; // same-page anchor
  }
  const hashIndex = target.indexOf("#");
  let route = hashIndex === -1 ? target : target.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : target.slice(hashIndex);
  if (!route.startsWith("/")) {
    route = path.posix.normalize(path.posix.join("/", pageDir, route));
  }
  if (isImage) {
    referencedMedia.add(route);
    return siteRoot + route; // hash on an image is a styling marker; drop it
  }
  if (llmFilePaths.includes(route)) {
    return siteRoot + route; // a generated file, not a page
  }
  route = route.replace(/\.md$/, ""); // page links, VitePress-style
  const twin = twinRoutes.get(route);
  return twin ? siteRoot + twin + hash : siteRoot + route + hash;
}

function rewriteLinks(text: string, pageDir: string): string {
  return text.replace(
    /(!?)\[([^\]]*)\]\(([^)\s]+)((?:\s+"[^"]*")?)\)/g,
    (_all, bang, label, target, title) =>
      `${bang}[${label}](${resolveTarget(target, pageDir, bang === "!")}${title})`,
  );
}

// ---------------------------------------------------------------------------
// The cleaner

const containerLabels: Record<string, string> = {
  tip: "Tip",
  info: "Note",
  note: "Note",
  warning: "Warning",
  caution: "Caution",
  danger: "Danger",
};

function cleanInline(line: string, ctx: CleanContext, pageDir: string) {
  const transformed = mapOutsideCode(line, (text) => {
    let out = replaceComponents(text, ctx);
    if (out !== text) {
      // a removed inline component leaves a doubled space behind
      out = out.replace(/(?<=\S) {2,}(?=\S)/g, " ");
    }
    if (ctx.mode === "page") {
      return out; // VitePress renders the rest natively
    }
    out = out.replace(/<code>(.*?)<\/code>/g, "`$1`");
    out = out.replace(/<a id="[^"]*"><\/a>/g, "");
    out = out.replace(/<\/?i>/g, "_");
    out = out.replace(/<hr[^>]*>/g, "---");
    out = out.replace(/&[#A-Za-z0-9]+;/g, (e) => entityMap[e] ?? e);
    return out.replace(
      /:([a-z0-9_+-]+):/g,
      (all, name) => emojiMap[name] ?? all,
    );
  });
  if (ctx.mode === "page") {
    return transformed; // relative links resolve correctly from dev/
  }
  // Link rewriting works on the whole line, because link labels can contain
  // code spans -- but code spans can also contain literal link syntax, so
  // mask them out first.
  const masked: string[] = [];
  const withPlaceholders = splitCodeSpans(transformed)
    .map((part) => {
      if (!part.isCode) {
        return part.text;
      }
      masked.push(part.text);
      return `\u0000${masked.length - 1}\u0000`;
    })
    .join("");
  return rewriteLinks(withPlaceholders, pageDir).replace(
    /\u0000(\d+)\u0000/g,
    (_all, index) => masked[Number(index)],
  );
}

/** Clean one page's VitePress Markdown into plain Markdown. */
function cleanPage(source: string, ctx: CleanContext): string {
  let text = source;
  for (const [find, replace] of pagePatches[ctx.file] ?? []) {
    if (!text.includes(find)) {
      throw new Error(`llmDocs: stale patch for ${ctx.file}: ${find.slice(0, 60)}`);
    }
    text = text.replace(find, replace);
  }
  // frontmatter
  text = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  // <script setup> and <style> blocks
  text = text.replace(/^<script[^>]*>[\s\S]*?<\/script>\s*$/gm, "");
  text = text.replace(/^<style[^>]*>[\s\S]*?<\/style>\s*$/gm, "");

  const pageDir = path.posix.dirname(ctx.file);
  const out: string[] = [];
  const containers: string[] = [];
  let fence: string | null = null;
  let inComment = false;
  for (let line of text.split("\n")) {
    // multi-line and single-line HTML comments (markdownlint directives,
    // commented-out prose)
    if (!fence) {
      if (inComment) {
        const close = line.indexOf("-->");
        if (close === -1) {
          continue;
        }
        line = line.slice(close + 3);
        inComment = false;
      }
      for (;;) {
        const open = line.indexOf("<!--");
        if (open === -1) {
          break;
        }
        const close = line.indexOf("-->", open + 4);
        if (close === -1) {
          line = line.slice(0, open);
          inComment = true;
          break;
        }
        line = line.slice(0, open) + line.slice(close + 3);
      }
      if (inComment && line.trim() === "") {
        continue;
      }
    }

    const fenceMatch = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (fenceMatch) {
      if (fence) {
        if (
          fenceMatch[1][0] === fence[0] &&
          fenceMatch[1].length >= fence.length &&
          fenceMatch[2].trim() === ""
        ) {
          fence = null;
        }
        out.push(line);
      } else {
        fence = fenceMatch[1];
        // inside a code group, a fence may carry a [label]; surface it as a
        // bold line above the fence
        const labelled = /^(\s*\S*)\s*\[([^\]]+)\]\s*$/.exec(
          fenceMatch[1] + fenceMatch[2],
        );
        if (
          ctx.mode === "twin" &&
          labelled &&
          containers.includes("code-group")
        ) {
          out.push(`**${labelled[2]}**`, "", labelled[1]);
        } else {
          out.push(line);
        }
      }
      continue;
    }
    if (fence) {
      // Shiki transformer comments, e.g. "// [!code focus:2]"
      out.push(
        ctx.mode === "page"
          ? line
          : line.replace(
              /\s*(?:\/\/|#|<!--|--|;)?\s*\[!code[^\]]*\](?:\s*-->)?\s*$/,
              "",
            ),
      );
      continue;
    }

    const container = /^:{3,}\s*([a-zA-Z-]*)\s*(.*)$/.exec(line);
    if (container && ctx.mode === "twin") {
      const [, kind, rawTitle] = container;
      if (!kind) {
        containers.pop();
        out.push("");
      } else {
        containers.push(kind);
        if (kind !== "code-group") {
          const title = cleanInline(rawTitle, ctx, pageDir).trim();
          const label = containerLabels[kind];
          if (label) {
            out.push(title ? `**${label}: ${title}**` : `**${label}:**`, "");
          } else if (kind === "details") {
            out.push(`**${title || "Details"}**`, "");
          } else {
            throw new Error(
              `llmDocs: unhandled container "${kind}" in ${ctx.file}`,
            );
          }
        }
      }
      continue;
    }

    // hand-written info boxes (<div class="info custom-block">): drop the
    // wrapper, keep the content
    if (ctx.mode === "twin" && /^<\/?div[\s>]/.test(line.trim())) {
      continue;
    }
    line = cleanInline(line, ctx, pageDir);
    // headings can lose an icon component; renormalize the gap
    line = line.replace(/^(#{1,6})\s+/, "$1 ");
    // (no prose in the docs relies on trailing-space hard breaks)
    out.push(line.trimEnd());
  }

  const cleaned = `${out.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
  verifyClean(cleaned, ctx);
  return cleaned;
}

// Guard against future page edits introducing constructs the cleaner does
// not handle: no component tags, containers or Shiki markers may survive
// outside code blocks.
function verifyClean(cleaned: string, ctx: CleanContext): void {
  let inFence = false;
  for (const line of cleaned.split("\n")) {
    if (/^\s{0,3}(`{3,}|~{3,})/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      continue;
    }
    if (ctx.mode === "twin" && /^:{3,}/.test(line)) {
      throw new Error(`llmDocs: leftover container in ${ctx.file}: ${line}`);
    }
    for (const part of splitCodeSpans(line)) {
      if (part.isCode) {
        continue;
      }
      if (/<[A-Z][A-Za-z0-9]*[\s/>]|<\/[A-Z]|<script|<style/.test(part.text)) {
        throw new Error(`llmDocs: leftover markup in ${ctx.file}: ${line}`);
      }
      if (ctx.mode === "twin" && part.text.includes("[!code")) {
        throw new Error(`llmDocs: leftover markup in ${ctx.file}: ${line}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Generation

interface CleanedPage extends LlmPage {
  content: string;
  /** Text of the page's H1. */
  heading: string;
}

async function cleanAllPages(): Promise<Map<string, CleanedPage>> {
  const versions = await popclipVersions();
  referencedMedia.clear();
  const result = new Map<string, CleanedPage>();
  for (const page of llmPages) {
    const source = readFileSync(path.join(siteDir, page.file), "utf8");
    const content = cleanPage(source, {
      file: page.file,
      versions,
      mode: "twin",
    });
    const heading = /^# (.+)$/m.exec(content)?.[1] ?? page.title;
    result.set(page.file, { ...page, content, heading });
  }
  return result;
}

// VitePress's heading slugger (@mdit-vue/shared slugify), reproduced here
// for collision detection between the concatenated sections' headings. An
// imperfect match only means a same-page anchor link is conservatively
// redirected to its standalone page.
function slugifyHeading(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // combining marks
    .replace(/[\u0000-\u001f]/g, "") // control characters
    .replace(/[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/^(\d)/, "_$1")
    .toLowerCase();
}

/**
 * The Developer Reference as one Markdown document for the /dev/all dynamic
 * page (see dev/[onepage].paths.ts), which VitePress renders in the normal
 * site theme. Cleaned in "page" mode: only frontmatter, script/style blocks
 * and Vue components are removed; containers, code groups and relative
 * links render natively (relative links resolve correctly because the page
 * lives in dev/ alongside its sources).
 */
export async function devOnePageContent(): Promise<string> {
  const versions = await popclipVersions();
  const dev = llmSections.find((s) => s.title === "Developer Reference");
  if (!dev) {
    throw new Error("llmDocs: no Developer Reference section");
  }
  // Heading slugs already claimed by earlier sections. When pages are
  // concatenated, a repeated heading gets a deduplicated anchor (-1), so a
  // same-page #anchor link in a later section would jump to the earlier
  // section's heading. Those links are redirected to the standalone page,
  // where the anchor is unambiguous.
  const seenSlugs = new Set<string>();
  const sections = dev.pages.map((page) => {
    const source = readFileSync(path.join(siteDir, page.file), "utf8");
    const content = cleanPage(source, {
      file: page.file,
      versions,
      mode: "page",
    });
    const route = `/${page.file}`
      .replace(/\.md$/, "")
      .replace(/\/index$/, "/");
    const pageSlugs: string[] = [];
    let inFence = false;
    const lines = content.split("\n").map((line) => {
      if (/^\s{0,3}(`{3,}|~{3,})/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) {
        return line;
      }
      const heading = /^#{1,6}\s+(.*)$/.exec(line);
      if (heading) {
        pageSlugs.push(slugifyHeading(heading[1]));
      }
      return line.replace(/\]\(#([A-Za-z0-9_-]+)\)/g, (all, slug) =>
        seenSlugs.has(slug) ? `](${route}#${slug})` : all,
      );
    });
    for (const slug of pageSlugs) {
      seenSlugs.add(slug);
    }
    const body = lines.join("\n");
    const h1 = /^# .+$/m.exec(body)?.[0];
    if (!h1) {
      throw new Error(`llmDocs: no H1 in ${page.file}`);
    }
    return `---\n\n${h1}\n\n_Standalone page: [${route}](${route})_\n\n${body.replace(/^# .+\n+/, "")}`;
  });
  const intro = `::: info One Page Docs
This is the entire Developer Reference on a single page. It is also available
in plain Markdown format at [/dev/all.md](/dev/all.md), along with the other
formats listed in [/llms.txt](/llms.txt).
:::

`;
  return intro + sections.join("\n");
}

// A page as it appears in a concatenated corpus: separator, title, source
// URL, then the body with its own H1 removed (the title replaces it).
function corpusEntry(page: CleanedPage): string {
  const body = page.content.replace(/^# .+\n+/, "");
  return `---\n\n# ${page.heading}\n\n> Source: ${siteRoot}/${page.file}\n\n${body}`;
}

function makeAllMd(pages: Map<string, CleanedPage>): string {
  const dev = llmSections.find((s) => s.title === "Developer Reference");
  if (!dev) {
    throw new Error("llmDocs: no Developer Reference section");
  }
  const header = `# PopClip Extension Development — Complete Documentation

> Every page of PopClip's extension developer reference, concatenated into
> one file. Individual pages are at the source URLs given below. The
> TypeScript type definitions for the JavaScript API and config format are
> at ${siteRoot}/dev/popclip.d.ts.

`;
  const body = dev.pages
    .map((page) => corpusEntry(pages.get(page.file)!))
    .join("\n");
  return header + body;
}

function makeLlmsFull(pages: Map<string, CleanedPage>): string {
  const header = `# PopClip — Complete Documentation

> All documentation for PopClip, the macOS text-selection actions app:
> developer reference, user guide and knowledge base, concatenated into one
> file. An index of the individual pages is at ${siteRoot}/llms.txt.

`;
  const body = llmSections
    .filter((section) => section.title !== "Optional")
    .flatMap((section) => section.pages)
    .map((page) => corpusEntry(pages.get(page.file)!))
    .join("\n");
  return header + body;
}

function makeLlmsTxt(): string {
  const sections = llmSections
    .map(
      (section) =>
        `## ${section.title}\n\n${section.pages
          .map(
            (page) =>
              `- [${page.title}](${siteRoot}/${page.file}): ${page.description}`,
          )
          .join("\n")}`,
    )
    .join("\n\n");
  return `# PopClip

> PopClip is a macOS app that shows a menu of actions — copy and paste, web
> search, link opening, translation and many more — when you select text with
> the mouse or trackpad. It is extensible: anyone can create extensions, from
> single-file text snippets to JavaScript packages, and publish them in the
> PopClip Extensions Directory.

Key resources for extension development:

- [Type definitions](${siteRoot}/dev/popclip.d.ts): Complete TypeScript definitions for PopClip's JavaScript API and extension config format
- [Developer docs in one file](${siteRoot}${ALL_MD_PATH}): The whole extension developer reference as a single Markdown file
- [All docs in one file](${siteRoot}${LLMS_FULL_PATH}): Developer reference, user guide and knowledge base as a single file

The pages below are Markdown twins of the pages at the same URL without the
\`.md\` suffix.

${sections}
`;
}

// ---------------------------------------------------------------------------
// Build and dev-server wiring

/** Write the twins and index files into a finished build. Call from
 * `buildEnd`. */
export async function writeLlmDocs(outDir: string): Promise<void> {
  const pages = await cleanAllPages();
  const write = (relPath: string, content: string) => {
    const destination = path.join(outDir, relPath);
    mkdirSync(path.dirname(destination), { recursive: true });
    writeFileSync(destination, content);
  };
  for (const page of pages.values()) {
    write(page.file, page.content);
  }
  write(ALL_MD_PATH.slice(1), makeAllMd(pages));
  write(LLMS_FULL_PATH.slice(1), makeLlmsFull(pages));
  write(LLMS_TXT_PATH.slice(1), makeLlmsTxt());
  // The images the twins reference, at their source paths (the VitePress
  // pages use hashed asset copies instead). Throws if a referenced file
  // does not exist -- a broken image path in the source.
  for (const route of referencedMedia) {
    const destination = path.join(outDir, route.slice(1));
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(path.join(siteDir, route.slice(1)), destination);
  }
}

/**
 * Serve the same files from the dev server, generated on demand from the
 * current sources. Served as text/plain like the deployed site (nginx has no
 * .md mapping and its default type is text/plain), so pages display in the
 * browser rather than downloading.
 */
export function llmDocsPlugin(): Plugin {
  const twinPaths = new Set(llmPages.map((page) => `/${page.file}`));
  return {
    name: "llm-docs",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url ?? "").split("?")[0];
        // The VitePress SPA itself loads pages by importing their .md path
        // as a module; those requests are Vite's to serve, not ours.
        if (req.headers["sec-fetch-dest"] === "script") {
          return next();
        }
        let content: string | undefined;
        try {
          if (url === LLMS_TXT_PATH) {
            content = makeLlmsTxt();
          } else if (url === ALL_MD_PATH) {
            content = makeAllMd(await cleanAllPages());
          } else if (url === LLMS_FULL_PATH) {
            content = makeLlmsFull(await cleanAllPages());
          } else if (twinPaths.has(url)) {
            const pages = await cleanAllPages();
            content = pages.get(url.slice(1))?.content;
          }
        } catch (error) {
          res.statusCode = 500;
          res.end(String(error));
          return;
        }
        if (content === undefined) {
          return next();
        }
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end(content);
      });
    },
  };
}
