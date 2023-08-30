// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import Theme from "vitepress/theme";
import "./style.css";
import { GithubFilled } from '@ant-design/icons-vue';
import Vercel from '../../src/Vercel.vue';

export default {
  extends: Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'layout-bottom': () => h(Vercel)
    });
  },
  enhanceApp({ app, router, siteData }) {
    app.component('GithubFilled', GithubFilled);
  },
};
