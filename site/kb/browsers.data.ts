import fs from "node:fs";
import { defineLoader } from "vitepress";
import { z } from "zod";

export const ZBrowser = z.object({
  name: z.string(),
  bundleId: z.string(),
  homepageUrl: z.string().url().nullish(),
  supportsAware: z.boolean(),
  supportsPageInfo: z.boolean(),
  supportsAddressBar: z.boolean(),
  supportsBackgroundTab: z.boolean(),
  supportsOpenIn: z.boolean(),
  // Flag for dev/beta/canary/nightly/preview builds
  isVariant: z.boolean().optional().default(false),
});
type Browser = z.infer<typeof ZBrowser>;

const ZBrowsersData = z.object({
  browsers: z.array(ZBrowser),
});
type BrowsersData = z.infer<typeof ZBrowsersData>;
declare const data: BrowsersData;
export { data };
export default defineLoader({
  watch: ["../../extras/OpenInBrowser.popclipext/browsers.json"],
  load(watchedFiles): BrowsersData {
    const browsers: Browser[] = [];
    for (const file of watchedFiles) {
      const data = ZBrowsersData.parse(
        JSON.parse(fs.readFileSync(file, "utf-8")),
      );
      for (const browser of data.browsers) {
        browsers.push(browser);
      }
    }
    // sort by name
    browsers.sort((a, b) => a.name.localeCompare(b.name));
    return { browsers };
  },
});
