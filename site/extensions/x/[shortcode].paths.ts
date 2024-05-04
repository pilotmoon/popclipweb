import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import {
  type PopClipDirectoryView,
  load,
} from "../../src/data/extensions.data";
import * as config from "../../src/config/config.json";
import axios from "axios";

declare const paths: PopClipDirectoryView[];
export { paths };

// markdown rendering (with html passed through)
const md = new MarkdownIt({
  html: true,
});

async function getMarkdown(markdownUrl: string) {
  const { data: markdown } = await axios.get(markdownUrl);
  let html = sanitizeHtml(md.render(markdown));

  // insert newline before these tags -- due to https://github.com/markdown-it/markdown-it/issues/951
  // (specifically these four as per https://spec.commonmark.org/0.30/#html-blocks)
  html = html.replace(/<pre/g, "\n<pre");
  html = html.replace(/<script/g, "\n<script");
  html = html.replace(/<style/g, "\n<style");
  html = html.replace(/<textarea/g, "\n<textarea");
  return html;
}

export default {
  async paths() {
    console.log("calling load from paths");
    const extensions = await load();
    await Promise.all(
      extensions.map(async (ext) => {
        if (ext.readme) {
          ext.readme = await getMarkdown(ext.readme);
          console.log(
            "\nRendered readme for extension",
            ext.name,
            ext.shortcode,
            ext.readme?.slice(0, 100),
          );
        }
      }),
    );
    return extensions.map((ext) => {
      return {
        params: ext,
        content: ext.readme,
      };
    });
  },
};
