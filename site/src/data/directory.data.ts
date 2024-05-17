import { defineLoader } from "vitepress";
import { z } from "zod";
import fs from "node:fs";
import jsYaml from "js-yaml";
import { gh } from "./gh";

const ZSection = z.object({
  title: z.string(),
  members: z.array(z.string()),
  link: z.string().optional(),
  special: z.boolean().optional(),
});
export type Section = z.infer<typeof ZSection>;

declare const data: Section[];
export { data };
export default defineLoader({
  async load() {
    const indexYaml = Buffer.from((
      await gh.get(
        "https://api.github.com/repos/pilotmoon/pcx-directory/contents/categories.yaml",
      )
    ).data.content, "base64").toString("utf-8");    
    const parseResult = z
      .record(z.array(z.string()))
      .safeParse(jsYaml.load(indexYaml));
    if (!parseResult.success) {
      throw new Error("Failed to parse directory index");
    }
    const arr: Section[] = [];
    for (const [title, members] of Object.entries(parseResult.data)) {
      arr.push({ title, members });
    }
    return arr;
  },
});
