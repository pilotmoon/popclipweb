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
});
export type CategoryDef = z.infer<typeof ZCategoryDef>;

// a section of the directory listing as rendered; members are extension
// identifiers
export interface Section {
  title: string;
  members: string[];
  // footer "View all in ..." link
  link?: string;
  special?: boolean;
}

declare const data: CategoryDef[];
export { data };
export default defineLoader({
  async load() {
    const response = await api.get("categories", {
      params: { format: "json", limit: 1000 },
    });
    const parseResult = z.array(ZCategoryDef).safeParse(response.data);
    if (!parseResult.success) {
      throw new Error("Failed to parse categories");
    }
    // page order: priority ascending, ties by title
    return parseResult.data.sort(
      (a, b) => a.priority - b.priority || a.title.localeCompare(b.title),
    );
  },
});
