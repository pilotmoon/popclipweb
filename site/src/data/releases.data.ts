import MarkdownIt from "markdown-it";
import axios from "../helpers/retryingAxios.ts";
import { defineLoader } from "vitepress";
import { z } from "zod";

// Rendered server-side (in this Node-only loader) rather than in
// Changelog.vue, so markdown-it -- and the Node-only punycode module its
// mdurl dependency pulls in -- never ends up in the client bundle.
const md = new MarkdownIt({ html: true });

export const ZRelease = z.object({
  versionString: z.string(),
  date: z.string(),
  description: z.string(),

  version: z.number().int().nullish(),
  url: z.string().url().nullish(),
  size: z.number().int().nullish(),
  pin: z.boolean().nullish(), // pin means should be make available for download
  zap: z.boolean().nullish(), // zap means do not make available for download (e.g. has a bug)
  minimumSystemVersion: z.string().nullish(),
  archs: z.array(z.string()).nullish(),
  eddsaSignature: z.string().nullish(),
});
export type Release = z.infer<typeof ZRelease> & { descriptionHtml: string };

export const ZReleases = z.array(ZRelease);
export type Releases = Release[];

export interface Data {
  production: Releases;
  beta: Releases;
}

declare const data: Data;
export { data };

export default defineLoader({
  load,
});

export async function load(): Promise<Data> {
  // use respective CMS client library if needed
  const { data: dataProd } = await axios.get(
    "https://pilotmoon.com/meta/popclip-releases.json",
  );
  const { data: dataBeta } = await axios.get(
    "https://pilotmoon.com/meta/popclip-releases-beta.json",
  );
  const withHtml = (releases: z.infer<typeof ZReleases>): Releases =>
    releases.map((release) => ({
      ...release,
      descriptionHtml: md.render(release.description),
    }));
  const result = {
    production: withHtml(ZReleases.parse(dataProd)),
    beta: withHtml(ZReleases.parse(dataBeta)),
  };
  return result;
}
