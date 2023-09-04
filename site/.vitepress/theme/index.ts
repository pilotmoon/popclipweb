// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import Theme from "vitepress/theme";
import "./style.css";
import { GithubFilled } from '@ant-design/icons-vue';

// vercel
import Vercel from '../../src/Vercel.vue';

// element-plus
import { ElButton } from 'element-plus'

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
    app.component(GithubFilled.name, GithubFilled);
    
    // vercel
    app.component(Vercel.name, Vercel);
    
    // element-plus
    app.component(ElButton.name, ElButton);

    // local
    app.component(Button.name, Button);
    app.component(DownloadButton.name, DownloadButton);
    app.component(EditionSwitcher.name, EditionSwitcher);
    app.component(Ed.name, Ed);
  },
};
