import { defineConfig } from 'vitepress'
import { getSidebar } from 'vitepress-plugin-auto-sidebar'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "PopClip",
  description: "Instant text actions for macOS",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/icon128.png",
    nav: [
      { text: 'User Guide', link: '/guide/' }
    ],
    sidebar: [
      {
        text: 'User Guide',
        items: [
          { text: 'Introduction', link: '/guide/' },
        ]
      }
    ],

    // socialLinks: [
    //   { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    // ]
  },
  head: [
    [
      'link',
      { rel: 'shortcut icon', href: '/icon32.png', type: 'image/png' },
    ],
  ]
})
