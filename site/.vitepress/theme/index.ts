// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import Theme from "vitepress/theme";
import "./style.css";
import { GithubFilled } from '@ant-design/icons-vue';

// vercel
import Vercel from '../../src/Vercel.vue';

// local
import Button from '../../src/Button.vue';
import DownloadButton from '../../src/DownloadButton.vue';
import EditionSwitcher from '../../src/EditionSwitcher.vue';
import Ed from '../../src/Ed.vue';

export default {
  extends: Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      // 'layout-bottom': () => h(Vercel)
    });
  },
  enhanceApp({ app, router, siteData }) {
    // TODO - make github link component
    app.component("GithubFilled", GithubFilled);
    
    // vercel
    app.component("Vercel", Vercel);

    // local
    app.component("Button", Button);
    app.component("DownloadButton", DownloadButton);
    app.component("EditionSwitcher", EditionSwitcher);
    app.component("Ed", Ed);
  },
};
