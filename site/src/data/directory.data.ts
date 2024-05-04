import { defineLoader } from "vitepress";
import { z } from "zod";
import fs from "node:fs";
import jsYaml from "js-yaml";
import axios from "axios";

const ZSection = z.object({
  title: z.string(),
  members: z.array(z.string()),
});
export type Section = z.infer<typeof ZSection>;

const GITHUB_API_KEY = process.env.GITHUB_API_KEY;
if (!GITHUB_API_KEY) {
  throw new Error("Missing GITHUB_API_KEY");
}

const gh = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Authorization: `Bearer ${GITHUB_API_KEY}`,
    "X-GitHub-Api-Version": "2022-11-28",
    Accept: "application/vnd.github+json",
  },
});

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
