import { defineLoader } from "vitepress";
import { z } from "zod";
import { api } from "./pilotmoonApi";

// category definitions from the backend's categories collection (which
// replaced the pcx-directory repo's categories.yaml). membership is the
// `category` field on each extension, so the sections themselves are
// assembled in Directory.vue where the extension data already lives.
const ZCategoryDef = z.object({
  slug: z.string(),
  title: z.string(),
  priority: z.number(),
  // per-category override of the front page's visible-entries cap
  frontPageLimit: z.number().nullish(),
});
export type CategoryDef = z.infer<typeof ZCategoryDef>;

export interface DirectoryData {
  // the build date (YYYY-MM-DD): seeds the front page's daily-rotating
  // selection, from the BUILD rather than the viewer's clock so server
  // render and client hydration always agree
  day: string;
  categories: CategoryDef[];
}

// a section of the directory listing as rendered; members are extension
// identifiers
export interface Section {
  title: string;
  // the members on display (possibly a truncated selection)
  members: string[];
  // the complete membership, searched instead of `members` when the user
  // types a query -- search always covers everything
  fullMembers?: string[];
  // footer link, with its text ("View all 17 in ..."). only present
  // when clicking it actually shows more than the section does
  link?: string;
  linkText?: string;
  // the section's own page, revealed as a link icon on heading hover
  pageLink?: string;
  special?: boolean;
}

declare const data: DirectoryData;
export { data };
export default defineLoader({
  async load(): Promise<DirectoryData> {
    const response = await api.get("categories", {
      params: { format: "json", limit: 1000 },
    });
    const parseResult = z.array(ZCategoryDef).safeParse(response.data);
    if (!parseResult.success) {
      throw new Error("Failed to parse categories");
    }
    return {
      day: new Date().toISOString().slice(0, 10),
      // page order: priority ascending, ties by title
      categories: parseResult.data.sort(
        (a, b) => a.priority - b.priority || a.title.localeCompare(b.title),
      ),
    };
  },
});
