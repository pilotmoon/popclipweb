import { defineLoader } from "vitepress";
import { type ExtInfo, load } from "./extensionInfo.ts";

// Lists need only summaries. Full records (files, version history, readmes,
// etc.) are already supplied to each extension's own dynamic page.
const directoryFields = [
  "id",
  "identifier",
  "shortcode",
  "name",
  "description",
  "icon",
  "download",
  "owner",
  "created",
  "firstCreated",
  "sourceDate",
  "firstListed",
  "unlisted",
  "category",
  "flagship",
  "popularity",
  "featurable",
  "demo",
  "demoAspect",
  "filterTerms",
] as const satisfies readonly (keyof ExtInfo)[];

export type DirectoryExtInfo = Pick<ExtInfo, (typeof directoryFields)[number]>;

declare const data: DirectoryExtInfo[];
export { data };
export default defineLoader({
  async load(): Promise<DirectoryExtInfo[]> {
    return (await load()).map(
      (ext) =>
        Object.fromEntries(
          directoryFields.map((key) => [key, ext[key]]),
        ) as DirectoryExtInfo,
    );
  },
});
