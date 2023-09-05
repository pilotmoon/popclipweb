// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import Theme from "vitepress/theme";
import "./style.css";

// vercel
import Vercel from "../../src/Vercel.vue";

// local
import AaButton from "../../src/AaButton.vue";
import AaLink from "../../src/AaLink.vue";
import DownloadButton from "../../src/DownloadButton.vue";
import EditionSwitcher from "../../src/EditionSwitcher.vue";
import Edition from "../../src/Edition.vue";
import HomeFooter from "../../src/HomeFooter.vue";
import StoreLoader from "../../src/StoreLoader.vue";

// element-plus css
// https://github.com/element-plus/element-plus/blob/dev/packages/theme-chalk/src/common/var.scss
import "element-plus/theme-chalk/dark/css-vars.css";
import "element-plus/es/components/switch/style/css";
import "element-plus/es/components/radio/style/css";
import "element-plus/es/components/radio-button/style/css";
import "element-plus/es/components/tag/style/css";
import "../../src/style/overrides.css";

export default {
  extends: Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      "layout-bottom": () => h('div', [h(Vercel)]),
      "home-features-after": () => h('div', [h(HomeFooter), h(StoreLoader)]),
    });
  },
  enhanceApp({ app, router, siteData }) {
    // local
    app.component("AaButton", AaButton);
    app.component("AaLink", AaLink);
    app.component("DownloadButton", DownloadButton);
    app.component("EditionSwitcher", EditionSwitcher);
    app.component("Edition", Edition);
  },
};
