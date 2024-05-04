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
  watch: ["./directory-index.yaml"],
  async load(watchedFiles: string[]) {
    const indexYaml = (
      await gh.get(
        "https://api.github.com/gists/59df578800096b9a4611b47d2d9a154a",
      )
    ).data.files["directory-index.yaml"].content;
    // const indexYaml = fs.readFileSync(watchedFiles[0], "utf-8");
    // const { data: indexYaml } = await axios.get("https://public.popclip.app/config/directory-index.yaml");
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
