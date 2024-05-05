import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import {
  type ExtInfo,
  load,
  type FileInfo,
} from "../../src/data/extensions.data";
import * as config from "../../src/config/config.json";
import axios from "axios";

declare const paths: ExtInfo[];
export { paths };

// markdown rendering (with html passed through)
const md = new MarkdownIt({
  html: true,
});

async function getMarkdown(markdownUrl: string, files: FileInfo[]) {
  const { data: markdown } = await axios.get(markdownUrl);
  let html = sanitizeHtml(md.render(markdown), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),    
    transformTags: {
      img: (tagName, attribs) => {
        // console.log("attribs", attribs);
        const blobUrl = files.find((f) => f.path === attribs.src)?.url
        if (!blobUrl) {
          return {
            tagName: "i",
            text: "[Remote image removed]"
          };
        }
        return {
          tagName,
          attribs: {
            ...attribs,
            src: config.pilotmoon.publicRoot + blobUrl,
          },
        };
      }
    },
  });
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
          ext.readme = await getMarkdown(ext.readme, ext.files);
          // console.log(
          //   "\nRendered readme for extension",
          //   ext.name,
          //   ext.shortcode,
          //   ext.readme?.slice(0, 100),
          // );
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
