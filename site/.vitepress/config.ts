import { defineConfig } from "vitepress";
import imageFigures from "markdown-it-image-figures";
import { html5Media } from "markdown-it-html5-media";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "PopClip",
  description: "Instant text actions for macOS",
  cleanUrls: true,
  sitemap: {
    hostname: "https://www.popclip.app",
  },
  themeConfig: {
    // logoLink: "/home",
    // search: {
    //   provider: 'local'
    // },
    notFound: {
      quote: "Sorry about that.",
    },
    logo: "/icon128.png",
    // editLink: {
    //   pattern: 'https://github.com/pilotmoon/popclipweb/edit/main/site/:path'
    // },
    nav: [
      {
        text: "Documentation",
        activeMatch:
          "^(/home|/guide/|/dev/|/changes|/download|/buy|/kb/|/terms|/privacy|/support|/beta)",
        link: "/home",
      },
      {
        text: "Extensions",
        link: "/extensions/",
        activeMatch: "(^/extensions/$)|(^/extensions/x)",
      },
      // {
      //   text: "Create",
      //   link: "/extensions/create",
      //   activeMatch:
      //     "^(/extensions/create)",
      // },
      {
        text: "Support",
        items: [
          { text: "Support & Feedback", link: "/support" },
          { text: "PopClip Forum", link: "https://forum.popclip.app/" },
        ],
      },
    ],
    sidebar: {
      "/extensions/": [
        {
          text: "Extensions",
          items: [
            { text: "Directory", link: "/extensions/" },
            { text: "Create", link: "/extensions/create" },
          ],
        },
      ],
      "/": [
        { text: "Start Here", link: "/home" },
        {
          text: "User Guide",
          collapsed: false,
          items: [
            { text: "Installation", link: "/guide/install" },
            { text: "Basic Usage", link: "/guide/basics" },
            { text: "Actions", link: "/guide/actions" },
            { text: "Settings", link: "/guide/settings" },
            { text: "Adding Extensions", link: "/guide/extensions" },
          ],
        },
        {
          text: "App Info",
          collapsed: false,
          items: [
            {
              text: "Download",
              link: "/download",
              collapsed: true,
              items: [
                { text: "Version History", link: "/changes" },
                { text: "Beta", link: "/beta" },
              ],
            },
            { text: "Buy", link: "/buy" },
            { text: "Support & Feedback", link: "/support" },
          ],
        },
        {
          text: "Knowledge Base",
          collapsed: false,
          items: [
            { text: "Troubleshooting", link: "/kb/troubleshooting" },
            {
              text: "In-depth topics",
              collapsed: true,
              items: [
                { text: "AppleScript interface", link: "/kb/applescript" },
                { text: "Browser support", link: "/kb/browsers" },
                { text: "Paths and identifiers", link: "/kb/paths" },
              ],
            },
          ],
        },
        {
          text: "Policies",
          collapsed: true,
          items: [
            { text: "Terms of License", link: "/terms.md" },
            { text: "Privacy Policy", link: "/privacy.md" },
          ],
        },
        {
          text: "Developer Reference",
          collapsed: true,
          items: [
            { text: "Introduction", link: "/dev/" },
            { text: "Snippets", link: "/dev/snippets" },
            { text: "Packages", link: "/dev/packages" },            
            { text: "The config dictionary", link: "/dev/config" },
            {
              items: [
                { text: "Shortcut actions", link: "/dev/shortcut-actions" },
                { text: "Service actions", link: "/dev/service-actions" },
                { text: "URL actions", link: "/dev/url-actions" },
                { text: "Key Press actions", link: "/dev/key-press-actions" },
                {
                  text: "AppleScript actions",
                  link: "/dev/applescript-actions",
                },
                {
                  text: "Shell Script actions",
                  link: "/dev/shell-script-actions",
                },
                { text: "JavaScript actions", link: "/dev/javascript-actions" },
              ],
            },
            { text: "Icons", link: "/dev/icons" },
            { text: "Changelog", link: "/dev/changes" },
          ],
        },
      ],
    },
  },
  head: [
    [
      "link",
      { rel: "shortcut icon", href: "/icon32.png", type: "image/png" },
    ],
  ],
  markdown: {
    config: (md) => {
      md.use(html5Media, {
        videoAttrs: "autoplay loop muted playsinline",
      });
      md.use(imageFigures, {
        figcaption: "title",
        copyAttrs: "^class$",
      });
    },
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag === "setapp-custom-banner",
      },
    },
  },
  transformPageData: (pageData, { siteConfig }) => {
    if (pageData.frontmatter.isExtensionPage) {
      pageData.title = pageData.params?.name;
    }
  },
});
