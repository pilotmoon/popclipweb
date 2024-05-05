import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import {
  type ExtInfo,
  load,
  type FileInfo,
} from "../../src/data/extensionInfo.ts";
import * as config from "../../src/config/config.json";
import axios from "axios";
import pLimit from "p-limit";

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
        const blobUrl = files.find((f) => f.path === attribs.src)?.url;
        if (!blobUrl) {
          return { tagName: "i", text: "[Remote image removed]" };
        }
        return {
          tagName,
          attribs: { ...attribs, src: config.pilotmoon.publicRoot + blobUrl },
        };
      },
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

async function processReadme(ext: ExtInfo) {
  if (ext.readme) {
    ext.readme = await getMarkdown(ext.readme, ext.files);
    console.log(
      `Rendered ${ext.readme?.length} bytes readme`,
      ext.shortcode,
      ext.identifier,
    );
  }
}

export default {
  async paths() {
    console.log("In paths loader");
    console.time("load paths");
    const extensions = await load();
    const limit = pLimit(30);
    await Promise.all(extensions.map((ext) => limit(() => processReadme(ext))));
    console.timeEnd("load paths");
    return extensions.map((ext) => ({
      params: ext,
      content: ext.readme,
    }));
  },
};
