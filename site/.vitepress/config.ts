import { html5Media } from "markdown-it-html5-media";
import imageFigures from "markdown-it-image-figures";
import ElementPlus from "unplugin-element-plus/vite";
import { defineConfig, type HeadConfig } from "vitepress";
import siteConfig from "../src/config/config.json";
import { querifyDescriptor } from "../src/helpers/iconDescriptor.js";
import { llmDocsPlugin, writeLlmDocs } from "./llmDocs.ts";
import { llmFilePaths, twinFiles } from "./llmPages.ts";
import mediaFigures from "./markdown/mediaFigures.ts";
import {
  popclipTypesPlugin,
  writePopClipTypes,
} from "./popclipTypes.ts";
import {
  typedocReferencePlugin,
  writeTypedocReference,
} from "./typedocReference.ts";

const siteRoot = "https://www.popclip.app";

// html description strings -> plain text for meta tags
function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function metaTags(entries: Record<string, string | null | undefined>) {
  return Object.entries(entries).flatMap(([property, content]) =>
    content
      ? [
          [
            "meta",
            property.startsWith("twitter:")
              ? { name: property, content }
              : { property, content },
          ] as HeadConfig,
        ]
      : [],
  );
}

// Open Graph tags for the dynamic pages, so pasted links unfurl into
// meaningful previews (Discourse oneboxes, chat apps, social cards)
// instead of the generic site tile. Icons are requested in a mid-grey
// that stays visible on light and dark preview backgrounds (the color
// only applies to monochrome template icons anyway).
function openGraph(relativePath: string, params: Record<string, unknown>) {
  const p = params as {
    name?: string;
    description?: string;
    shortcode?: string;
    icon?: string | null;
    githubHandle?: string;
    bio?: string | null;
    avatarUrl?: string | null;
    slug?: string;
    title?: string;
  };
  if (relativePath.startsWith("extensions/categories/") && p.slug && p.title) {
    return metaTags({
      "og:type": "website",
      "og:site_name": "PopClip Extensions Directory",
      "og:title": p.title,
      "og:description":
        p.description || `PopClip extensions in the ${p.title} category.`,
      "og:url": `${siteRoot}/extensions/categories/${p.slug}`,
      "twitter:card": "summary",
    });
  }
  if (relativePath.startsWith("extensions/x/") && p.shortcode) {
    return metaTags({
      "og:type": "website",
      "og:site_name": "PopClip Extensions Directory",
      "og:title": p.name,
      "og:description": p.description ? plainText(p.description) : null,
      "og:url": `${siteRoot}/extensions/x/${p.shortcode}`,
      "og:image": p.icon
        ? `${siteConfig.pilotmoon.iconsRoot}/icon?${querifyDescriptor(
            { specifier: p.icon.trim(), color: "#555555", height: 256 },
            "a2",
          )}`
        : null,
      "twitter:card": "summary",
    });
  }
  if (relativePath.startsWith("extensions/authors/") && p.shortcode) {
    const name = p.name || p.githubHandle;
    return metaTags({
      "og:type": "profile",
      "og:site_name": "PopClip Extensions Directory",
      "og:title": name,
      "og:description": p.bio || (name ? `PopClip extensions by ${name}` : null),
      "og:url": `${siteRoot}/extensions/authors/${p.shortcode}`,
      "og:image": p.avatarUrl ?? null,
      "twitter:card": "summary",
    });
  }
  return [];
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "PopClip",
  titleTemplate: ":title — PopClip",
  description: "Instant text actions for macOS",
  cleanUrls: true,
  // The /dev/api/ pages are typedoc output written into the dist by buildEnd,
  // so the dead-link checker cannot see them.
  ignoreDeadLinks: [/^\/dev\/api\//],
  lastUpdated: false,
  sitemap: {
    hostname: "https://www.popclip.app",
    // The post-checkout page has no business in search results: of the states
    // it can show, most are states a searcher arriving cold would find
    // alarming ("We cannot find your purchase"), and none are useful without
    // the purchase data held in the buyer's own tab. /purchase-complete is the
    // retained alias for the same page, so it stays out too. /dev/all is the
    // one-page developer reference -- all duplicate content, so the
    // individual pages keep the search traffic.
    transformItems: (items) =>
      items.filter(
        (item) =>
          item.url !== "purchase-status" &&
          item.url !== "purchase-complete" &&
          item.url !== "dev/all",
      ),
  },
  themeConfig: {
    footer: {
      copyright:
        'Copyright © 2011-2026 Nicholas Moore, <a href="https://pilotmoon.com/about/">Pilotmoon Software</a>',
    },
    search: {
      provider: "algolia",
      options: {
        appId: "2OKYDNY04O",
        apiKey: "e035954eb950fa45d7dc871068a53648",
        indexName: "popclip",
      },
    },
    lastUpdated: {
      formatOptions: {
        dateStyle: "medium",
      },
    },
    notFound: {
      quote: "Sorry about that.",
    },
    logo: "/icon128.png",
    editLink: {
      pattern: "https://github.com/pilotmoon/popclipweb/edit/main/site/:path",
      text: "Edit this page on GitHub",
    },
    nav: [
      {
        text: "Guide",
        activeMatch:
          "^(/guide/|/changelog|/download|/buy|/kb/|/terms|/privacy|/support|/beta)",
        link: "/guide/",
      },
      {
        text: "Extensions",
        link: "/extensions/",
        activeMatch: "(^/extensions/$)|(^/extensions/x)",
      },
      {
        text: "Reference",
        activeMatch: "^(/dev/)",
        link: "/dev/",
      },
      {
        text: "Support",
        items: [
          { text: "Support & Feedback", link: "/support" },
          { text: "PopClip Forum", link: "https://forum.popclip.app/" },
        ],
      },
    ],
    sidebar: {
      "/dev/": [
        {
          text: "One Page",
          link: "/dev/all",
        },
        {
          text: "llms.txt",
          link: "/llms.txt",
          target: "_self",
        },
        {
          text: "Developer Reference",
          items: [
            { text: "Introduction", link: "/dev/" },
            { text: "Snippets", link: "/dev/snippets" },
            { text: "Packages", link: "/dev/packages" },

            {
              text: "Config",
              link: "/dev/config",
            },
            { text: "Icons", link: "/dev/icons" },
            {
              text: "Actions",
              link: "/dev/actions",
              items: [
                { text: "Open URL actions", link: "/dev/url-actions" },
                { text: "Key Press actions", link: "/dev/key-press-actions" },
                { text: "Service actions", link: "/dev/service-actions" },
                { text: "Shortcut actions", link: "/dev/shortcut-actions" },
                { text: "JavaScript actions", link: "/dev/js-actions" },
                {
                  text: "AppleScript actions",
                  link: "/dev/applescript-actions",
                },
                {
                  text: "Shell Script actions",
                  link: "/dev/shell-script-actions",
                },
              ],
            },

            { text: "Script variables", link: "/dev/script-variables" },

            {
              text: "JavaScript environment",
              link: "/dev/js-environment",
              items: [
                {
                  text: "API reference",
                  link: "/dev/api/",
                  target: "_self",
                },
                {
                  text: "Type definitions",
                  link: "/dev/popclip.d.ts",
                  target: "_blank",
                },
              ],
            },
            {
              text: "Module-based extensions",
              link: "/dev/js-modules",
            },
            { text: "Changelog", link: "/dev/changelog" },
          ],
        },
        {
          text: "User Guide",
          link: "/guide/",
        },
      ],
      "/": [
        { text: "Welcome", link: "/guide/" },
        {
          text: "User Guide",
          items: [
            { text: "Installation", link: "/guide/install" },
            { text: "Basics", link: "/guide/basics" },
            { text: "Built-in Actions", link: "/guide/actions" },
            { text: "Extensions", link: "/guide/extensions" },
            { text: "Organizing Actions", link: "/guide/organizing" },
            { text: "Settings", link: "/guide/settings" },
          ],
        },
        {
          text: "App Info",
          items: [
            {
              text: "Download",
              link: "/download",
            },
            { text: "Buy", link: "/buy" },
            { text: "Version History", link: "/changelog" },
            { text: "Support & Feedback", link: "/support" },
          ],
        },

        {
          text: "Knowledge Base",
          items: [
            { text: "Mac App Store migration", link: "/kb/mas" },
            { text: "Troubleshooting", link: "/kb/troubleshooting" },
            { text: "iCloud Sync", link: "/kb/sync" },
            { text: "AppleScript interface", link: "/kb/applescript" },
            { text: "Browser support", link: "/kb/browsers" },
            { text: "Paths and identifiers", link: "/kb/paths" },
            { text: "Technical notes", link: "/kb/notes" },
          ],
        },
        {
          text: "Policies",
          items: [
            { text: "Terms of License", link: "/terms.md" },
            { text: "Privacy Policy", link: "/privacy.md" },
          ],
        },
        {
          text: "Developer Reference",
          link: "/dev/",
        },
      ],
    },
  },
  transformHead({ pageData }) {
    const head = openGraph(pageData.relativePath, pageData.params ?? {});
    // Docs pages with a plain-Markdown twin (see llmDocs.ts) advertise it.
    // The one-page view resolves to relativePath "dev/all.md", which is
    // exactly the path of its generated Markdown counterpart.
    if (
      twinFiles.has(pageData.relativePath) ||
      pageData.relativePath === "dev/all.md"
    ) {
      head.push([
        "link",
        {
          rel: "alternate",
          type: "text/markdown",
          href: `${siteRoot}/${pageData.relativePath}`,
        },
      ]);
    }
    return head;
  },
  head: [
    ["link", { rel: "shortcut icon", href: "/icon32.png", type: "image/png" }],
    ["link", { rel: "preconnect", href: "https://icons.popclip.app/" }],
    ["link", { rel: "preconnect", href: "https://public.popclip.app/" }],
    ["link", { rel: "preconnect", href: "https://api.pilotmoon.com/v2" }],
  ],
  markdown: {
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
    config: (md) => {
      md.use(html5Media, {
        videoAttrs: "autoplay loop muted playsinline",
      });
      md.use(imageFigures, {
        figcaption: "title",
        copyAttrs: "^class$",
      });
      md.use(mediaFigures);
      // /dev/api/ pages are typedoc output, and the llms/all.md files are
      // plain files written by llmDocs.ts -- not VitePress pages. A target
      // attribute makes the SPA router leave the links alone, so the browser
      // fetches them normally instead of routing to a 404. (It also makes
      // VitePress's own link rule skip the href entirely: no clean-URL
      // rewriting, no dead-link check.)
      const defaultLinkOpen =
        md.renderer.rules.link_open ??
        ((tokens, idx, options, _env, self) =>
          self.renderToken(tokens, idx, options));
      md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const href = tokens[idx].attrGet("href");
        if (href && (href.startsWith("/dev/api/") || llmFilePaths.includes(href))) {
          tokens[idx].attrSet("target", "_self");
        }
        return defaultLinkOpen(tokens, idx, options, env, self);
      };
    },
  },
  vite: {
    ssr: {
      noExternal: ["element-plus"],
    },
    plugins: [
      ElementPlus({}),
      popclipTypesPlugin(),
      typedocReferencePlugin(),
      llmDocsPlugin(),
    ],
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag === "setapp-custom-banner",
      },
    },
  },
  buildEnd: async ({ outDir }) => {
    writePopClipTypes(outDir);
    await writeTypedocReference(outDir);
    await writeLlmDocs(outDir);
  },
  transformPageData: (pageData, { siteConfig }) => {
    if (pageData.frontmatter.isExtensionPage) {
      pageData.title = pageData.params?.name;
    }
    if (pageData.frontmatter.isAuthorPage) {
      pageData.title = pageData.params?.name || pageData.params?.githubHandle;
    }
    if (pageData.frontmatter.isCategoryPage) {
      pageData.title = pageData.params?.title;
    }
  },
});
