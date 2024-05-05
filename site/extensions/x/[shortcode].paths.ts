import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import {
  type ExtInfo,
  load,
  type FileInfo,
} from "../../src/data/extensions.data";
import * as config from "../../src/config/config.json";
import axios from "axios";
import pLimit from "p-limit";
import { api } from "../../src/data/pilotmoonApi.ts";
import { z } from "zod";

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

const ZVersionInfo = z.object({
  id: z.string(),
  created: z.coerce.date(),
  version: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  description: z.string(), 
  source: z.string().nullable(),
  sourceDate: z.coerce.date().nullable(),
  download: z.string().nullable(),
  owner: z.string().nullable(),
});
export type VersionInfo = z.infer<typeof ZVersionInfo>;

async function getVersions(shortcode: string) {
  const response = await api.get("extensions", {
    params: {
      shortcode,
      view: "popclip",
      format: "json",
      limit: 30,
    },
  });
  const parseResult = z.array(ZVersionInfo).safeParse(response.data);
  if (!parseResult.success) {
    throw new Error("Failed to parse previous version info");
  }
  return parseResult.data;
}

async function processExtension(ext: ExtInfo) {
    if (ext.readme) {
      ext.readme = await getMarkdown(ext.readme, ext.files);
      console.log(
        "\nRendered readme for extension",
        ext.name,
        ext.shortcode,
        ext.readme?.slice(0, 100),
      );
    }
}

export default {
  async paths() {
    console.log("calling load from paths");
    const extensions = await load();
    const limit = pLimit(20);
    await Promise.all(
      extensions.map(async (ext) => limit(


      })),


    );
    return extensions.map((ext) => {
      return {
        params: ext,
        content: ext.readme,
      };
    });
  },
};
