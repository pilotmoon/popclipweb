import { defineConfig } from "vitepress";
import { getSidebar } from "vitepress-plugin-auto-sidebar";
import imageFigures from "markdown-it-image-figures";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "PopClip",
  description: "Instant text actions for macOS",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/icon128.png",
    nav: [
      { text: "Documentation", link: "/guide/" },
    ],
    sidebar: [
      {
        text: "User Guide",
        items: [
          { text: "Introduction", link: "/guide/" },
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Basics", link: "/guide/basics" },
          { text: "Settings", link: "/guide/settings" },
          { text: "Extensions", link: "/guide/extensions" },
          { text: "Support and Feedback", link: "/guide/support" },
        ],
      },
      {
        text: "App Information",
        items: [
          { text: "Download", link: "" },
          { text: "Purchase", link: "" },
          {
            text: "Version History",
            link: "/changelog",
            // items: [
            //   { text: "Version History (Beta)", link: "/changelog-beta" },
            // ],
          },
          {
            text: "Policies",
            link: "/guide/basics",
            items: [
              { text: "Terms of license", link: "/guide/basics" },
              { text: "Privacy policy", link: "" },
            ],
          },
        ],
      },
      {
        text: "Knowledge Base",
        items: [
          { text: "Known Issues", link: "/kb/compatibility" },
          { text: "Troubleshooting", link: "/guide/troubleshooting" },
          { text: "FAQ", link: "/guide/faq" },
          { text: "Browsers", link: "/kb/compatibility" },
        ],
      },
    ],
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
    // config: (md) => {
    //   md.use(imageFigures, {
    //     figcaption: 'title',
    //     copyAttrs: '^class$',
    //   });
    // },
  },
});
