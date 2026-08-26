// The manifest of documentation pages that get plain-Markdown twins for
// LLM (and human) consumption: each page here is served both as a VitePress
// page (/dev/actions) and as cleaned Markdown at its source path
// (/dev/actions.md). The same list drives /llms.txt, /dev/all.md and
// /llms-full.txt -- see llmDocs.ts for the generation.
//
// This module is pure data with no node imports, because transformHead and
// the markdown-it link rule in config.ts also read it. Dynamic pages
// (extensions directory, authors, categories) and pages that are mostly Vue
// components (home, buy, download, changelog, kb/browsers) are deliberately
// absent: their Markdown source is meaningless without rendering.

export const siteRoot = "https://www.popclip.app";

// The composite files generated alongside the twins (see llmDocs.ts). Doc
// pages may link to these paths directly; the markdown-it rule in config.ts
// gives such links target="_self" so the SPA router leaves them alone (which
// also stops VitePress rewriting the .md href to a clean URL).
export const ALL_MD_PATH = "/dev/all.md";
export const LLMS_TXT_PATH = "/llms.txt";
export const LLMS_FULL_PATH = "/llms-full.txt";
export const llmFilePaths: string[] = [
  ALL_MD_PATH,
  LLMS_TXT_PATH,
  LLMS_FULL_PATH,
];

export interface LlmPage {
  /** Source path relative to the site root, e.g. "dev/actions.md". The twin
   * is served at this same path, so it doubles as the public URL path. */
  file: string;
  /** Display name for the llms.txt bullet, per the sidebar. */
  title: string;
  /** One-line description for the llms.txt bullet. */
  description: string;
}

export interface LlmSection {
  title: string;
  pages: LlmPage[];
}

// Section order and page order mirror the sidebars in config.ts.
export const llmSections: LlmSection[] = [
  {
    title: "Developer Reference",
    pages: [
      {
        file: "dev/index.md",
        title: "Introduction",
        description:
          "Entry point to the extension developer docs: concepts, resources and how to get help",
      },
      {
        file: "dev/snippets.md",
        title: "Snippets",
        description:
          "Extension snippets — plain-text extensions that install directly from selected text",
      },
      {
        file: "dev/packages.md",
        title: "Packages",
        description:
          "Extension packages — the .popclipext folder format, its files and installation",
      },
      {
        file: "dev/config.md",
        title: "Config",
        description:
          "The extension configuration dictionary: formats, top-level properties, options and localization",
      },
      {
        file: "dev/icons.md",
        title: "Icons",
        description:
          "Icon specifier strings: text icons, modifiers, Iconify icons, SF Symbols, image files and SVG",
      },
      {
        file: "dev/actions.md",
        title: "Actions",
        description:
          "Properties common to all actions: titles, icons, requirements, before/after steps and submenus",
      },
      {
        file: "dev/url-actions.md",
        title: "Open URL actions",
        description:
          "Actions that open a URL generated from a template, e.g. web searches",
      },
      {
        file: "dev/key-press-actions.md",
        title: "Key Press actions",
        description:
          "Actions that simulate a key press with a key combo specifier",
      },
      {
        file: "dev/service-actions.md",
        title: "Service actions",
        description: "Actions that invoke a macOS Service by name",
      },
      {
        file: "dev/shortcut-actions.md",
        title: "Shortcut actions",
        description: "Actions that invoke a macOS Shortcut by name",
      },
      {
        file: "dev/js-actions.md",
        title: "JavaScript actions",
        description:
          "Actions that run JavaScript code in PopClip's JavaScript environment",
      },
      {
        file: "dev/applescript-actions.md",
        title: "AppleScript actions",
        description:
          "Actions that run AppleScript code, for automating other apps",
      },
      {
        file: "dev/shell-script-actions.md",
        title: "Shell Script actions",
        description:
          "Actions that run a shell script in any scripting language, with variables and output handling",
      },
      {
        file: "dev/script-variables.md",
        title: "Script variables",
        description:
          "The context variables PopClip passes to JavaScript, AppleScript and shell scripts",
      },
      {
        file: "dev/js-environment.md",
        title: "JavaScript environment",
        description:
          "PopClip's sandboxed JavaScript runtime: globals, modules, network access and utilities",
      },
      {
        file: "dev/js-modules.md",
        title: "Module-based extensions",
        description:
          "Defining a whole extension in JavaScript or TypeScript with defineExtension()",
      },
      {
        file: "dev/changelog.md",
        title: "Developer Changelog",
        description:
          "Changes to the extensions programming interface, by PopClip version",
      },
    ],
  },
  {
    title: "User Guide",
    pages: [
      {
        file: "guide/index.md",
        title: "Welcome",
        description:
          "Introduction to PopClip and answers to frequently asked questions",
      },
      {
        file: "guide/install.md",
        title: "Installation",
        description:
          "System requirements, editions (Standalone, Mac App Store, Setapp) and how to install",
      },
      {
        file: "guide/basics.md",
        title: "Basics",
        description:
          "Using the PopClip bar: making it appear and disappear, and controlling when it shows",
      },
      {
        file: "guide/actions.md",
        title: "Built-in Actions",
        description:
          "The built-in actions: Cut, Copy, Paste, Search, Open Link, Dictionary and more",
      },
      {
        file: "guide/extensions.md",
        title: "Extensions",
        description:
          "Installing and managing extensions, and extension security",
      },
      {
        file: "guide/organizing.md",
        title: "Organizing Actions",
        description:
          "Arranging actions with folders and separators, custom names and icons",
      },
      {
        file: "guide/settings.md",
        title: "Settings",
        description: "The status menu and the settings window, tab by tab",
      },
    ],
  },
  {
    title: "Knowledge Base",
    pages: [
      {
        file: "kb/mas.md",
        title: "Mac App Store migration",
        description:
          "How to migrate from the Mac App Store edition to the Standalone edition",
      },
      {
        file: "kb/troubleshooting.md",
        title: "Troubleshooting",
        description:
          "Common problems and solutions, and known issues with specific apps",
      },
      {
        file: "kb/sync.md",
        title: "iCloud Sync",
        description:
          "Syncing extensions and actions between Macs with iCloud",
      },
      {
        file: "kb/applescript.md",
        title: "AppleScript interface",
        description: "Controlling the PopClip app itself from AppleScript",
      },
      {
        file: "kb/paths.md",
        title: "Paths and identifiers",
        description: "File and folder paths and identifiers used by PopClip",
      },
      {
        file: "kb/notes.md",
        title: "Technical notes",
        description:
          "Assorted technical details, including website exclusion support",
      },
    ],
  },
  {
    title: "Optional",
    pages: [
      {
        file: "extensions/submit.md",
        title: "Submit an Extension",
        description:
          "How to submit an extension to the PopClip Extensions Directory, and the acceptance requirements",
      },
      {
        file: "terms.md",
        title: "Terms of License",
        description: "Terms of license for the PopClip app",
      },
      {
        file: "privacy.md",
        title: "Privacy Policy",
        description: "PopClip's privacy policy",
      },
      {
        file: "support.md",
        title: "Support & Feedback",
        description: "How to get help: email support and the PopClip forum",
      },
    ],
  },
];

export const llmPages: LlmPage[] = llmSections.flatMap(
  (section) => section.pages,
);

/** Source paths (e.g. "dev/actions.md") of every page that has a twin. */
export const twinFiles: Set<string> = new Set(
  llmPages.map((page) => page.file),
);

/**
 * Whether a page shows the visible "View as Markdown" link. Every twinned
 * page advertises its twin via the head tag, but the visible link is only
 * for reference-flavored pages: the dev subtree, the extension submission
 * page, the knowledge base and the policies. The user guide and app-info
 * pages stay link-free.
 */
export function showsTwinLink(file: string): boolean {
  if (file === "dev/all.md") {
    return true; // the one-page view; its twin is generated, not a manifest page
  }
  return (
    twinFiles.has(file) &&
    (file.startsWith("dev/") ||
      file.startsWith("kb/") ||
      file === "extensions/submit.md" ||
      file === "terms.md" ||
      file === "privacy.md")
  );
}
