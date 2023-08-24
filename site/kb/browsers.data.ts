import { defineLoader } from "vitepress";
import { z } from "zod";
import fs from "node:fs";

export const ZBrowser = z.object({
  name: z.string(),
  bundleId: z.string(),
  homepageUrl: z.string().url().nullish(),
  supportsAware: z.boolean(),
  supportsPageInfo: z.boolean(),
  supportsAddressbar: z.boolean(),
  supportsOpenIn: z.boolean(),
});
type Browser = z.infer<typeof ZBrowser>;

interface BrowsersData {
  browsers: Browser[];
}

declare const data: BrowsersData;
export { data };
export default defineLoader({
  watch: ["./browsers.json"],
  load(watchedFiles): BrowsersData {
    const browsers: Browser[] = [];
    for (const file of watchedFiles) {
      for (const browser of JSON.parse(fs.readFileSync(file, "utf-8"))) {
        browsers.push(browser);
      }
    }
    // sort by name
    browsers.sort((a, b) => a.name.localeCompare(b.name));
    return { browsers };
  },
});
