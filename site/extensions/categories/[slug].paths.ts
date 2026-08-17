import { z } from "zod";
import { api } from "../../src/data/pilotmoonApi.ts";

// one page per category, straight from the backend's categories
// collection (the directory page's loader fetches the same data; this
// runs at paths-resolution time so it fetches its own copy, including
// the description, which only these pages display)
const ZCategoryPageDef = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  priority: z.number(),
});
export type CategoryPageDef = z.infer<typeof ZCategoryPageDef>;

declare const paths: CategoryPageDef[];
export { paths };

export default {
  async paths() {
    const response = await api.get("categories", {
      params: { format: "json", limit: 1000 },
    });
    const parseResult = z.array(ZCategoryPageDef).safeParse(response.data);
    if (!parseResult.success) {
      throw new Error("Failed to parse categories for category pages");
    }
    return parseResult.data.map((def) => ({ params: { ...def } }));
  },
};
