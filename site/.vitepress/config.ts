import { defineConfig } from "vitepress";
import imageFigures from "markdown-it-image-figures";
import { html5Media } from "markdown-it-html5-media";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "PopClip",
  description: "Instant text actions for macOS",
  cleanUrls: true,
  sitemap: {
    hostname: 'https://www.popclip.app'
  },
  themeConfig: {
    search: {
      provider: 'local'
    },
    // https://vitepress.dev/reference/default-theme-config
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
          "^(/guide/|/ref/|/changelog|/dowload|/buy|/kb/|/terms|/privacy|/download|/support|/beta)",
        link: "/guide/",
        // items: [
        //   { text: "User Guide", link: "/guide/" },
        //   { text: "Developer Reference", link: "/ref/" },
        // ],
      },
      {
        text: "Extensions",
        link: "/extensions/",
        activeMatch:
          "(^/extensions/$)|(^/extensions/x)",
        // link: "https://pilotmoon.com/popclip/extensions/",
        // items: [
        //   { text: "Directory", link: "/x/" },
        //   { text: "Creator", link: "/create/" },
        // ],
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
      // "/ref/": [
      //   { text: "Guide", link: "/docs" },
      //   {
      //     text: "Developer Reference",
      //     items: [
      //       { text: "Introduction", link: "/ref/" },
      //       { text: "Page 1", link: "/ref/page1" },            
      //     ],
      //   },
      // ],
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
        { text: "What is PopClip?", link: "/guide/" },
        {
          text: "User Guide",
          // link: "/docs",
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
                { text: "Version History", link: "/changelog" },
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
            { text: "Known Issues", link: "/kb/known-issues" },
            { text: "FAQ", link: "/kb/faq" },
            {
              text: "In-depth topics",
              collapsed: true,
              items: [
                { text: "AppleScript interface", link: "/kb/applescript" },
                { text: "Browser compatibilty", link: "/kb/browsers" },
                { text: "File locations", link: "/kb/editions" },
                { text: "Hidden settings", link: "/kb/hidden-settings" },
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
        // {
        //   text: "Developer Reference",
        //   link: "https://github.com/pilotmoon/PopClip-Extensions",
        // },
        // {
        //   text: "Developer Reference",
        //   link: "/ref/",
        // },
        {
          text: "Developer Reference",
          items: [
            { text: "Introduction", link: "/ref/" },
            { text: "Changelog", link: "/ref/changelog" },            
          ],
        },
      ],
    },
    // socialLinks: [
    //   { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    // ]
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
      // md.use(imgSize);
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
  }
});
