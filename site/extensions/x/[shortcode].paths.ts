import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import {
  type ExtInfo,
  load,
  type FileInfo,
  publicRoot,
} from "../../src/data/extensionInfo.ts";
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
          attribs: { ...attribs, src: publicRoot + blobUrl },
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
    // a readme that can't be fetched or rendered shouldn't take down the
    // whole site build -- drop it and carry on. (expected in local
    // development against a local backend: blob urls point at the
    // production public root, which has no local-only blobs.)
    try {
      ext.readme = await getMarkdown(ext.readme, ext.files);
      console.log(
        `Rendered ${ext.readme?.length} bytes readme`,
        ext.shortcode,
        ext.identifier,
      );
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      console.warn(
        `Failed to render readme for ${ext.shortcode} (${ext.identifier}): ${
          status ?? err
        }`,
      );
      ext.readme = null;
    }
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
