import { z } from "zod";
import { classicExtensions } from "./classic.ts";
import * as config from "../config/config.json";
import { api } from "./pilotmoonApi.ts";

// what we get back from the extensions endpoint of the API
const ZAppInfo = z.object({ name: z.string(), link: z.string() });
export type AppInfo = z.infer<typeof ZAppInfo>;

const ZFileInfo = z.object({
  path: z.string(),
  url: z.string(),
  executable: z.boolean().optional(),
});
export type FileInfo = z.infer<typeof ZFileInfo>;

const ZPartialExtInfo = z.object({
  version: z.string(),
  name: z.string(),
  source: z.string().nullable(),
  sourceDate: z.coerce.date().nullable(),
  download: z.string().nullable(),
});
export const ZExtInfo = ZPartialExtInfo.extend({
  id: z.string(),
  created: z.coerce.date(),
  firstCreated: z.coerce.date(),
  shortcode: z.string(),
  identifier: z.string(),
  icon: z.string().nullable(),
  description: z.string(),
  keywords: z.string(),
  apps: z.array(ZAppInfo),
  files: z.array(ZFileInfo),
  owner: z.string().nullable(),
  previousVersions: z.array(ZPartialExtInfo),
  // extras that we add:
  demo: z.string().nullish(),
  readme: z.string().nullish(),
});
export type ExtInfo = z.infer<typeof ZExtInfo>;

export async function load() {
  console.log("In extensions loader");
  console.time("load extensions");
  let cursor: string | undefined;
  const exts: ExtInfo[] = [];
  do {
    const response = await api.get("extensions", {
      params: {
        view: "popclipDirectory",
        format: "json",
        limit: 300,
        cursor,
      },
    });
    const parseResult = z.array(ZExtInfo).safeParse(response.data);
    if (!parseResult.success) {
      throw new Error("Failed to parse extensions info");
    }
    for (const ext of parseResult.data) {
      ext.firstCreated = adjustFirstCreated(ext.firstCreated, ext.identifier);
      ext.description = linkifyDescription(ext.description, ext.apps);
      ext.demo = adjustPublicPath(findSpecialFile("demo.mp4", ext.files) ?? findSpecialFile("demo.gif", ext.files));
      ext.readme = adjustPublicPath(findSpecialFile("readme.md", ext.files));
      ext.download = adjustPublicPath(ext.download);
      for (const prev of ext.previousVersions) {
        prev.download = adjustPublicPath(prev.download);
      }
      exts.push(ext);
    }
    cursor = parseResult.data.at(-1)?.id;
  } while (cursor);
  console.log(`Loaded ${exts.length} extensions from the API`);
  console.timeEnd("load extensions");
  return exts;
}

// replace app names with html link to apps
function linkifyDescription(description: string, apps: AppInfo[]) {
  let html = description;
  for (const app of apps) {
    html = description.replace(
      new RegExp(`\\b${app.name}\\b`),
      `<a href="${app.link}">${app.name}</a>`
    );
  }
  return html;
}

// replace first created date with actual dates from the old extensions that predate the new backend
function adjustFirstCreated(date: Date, identifier: string) {
  const unixDate = classicExtensions().get(identifier)?.date;
  return unixDate ? new Date(unixDate * 1000) : date;
}

// adjust blob paths to full URLs
function adjustPublicPath(path: string | null) {
  if (path?.startsWith("/")) {
    return config.pilotmoon.publicRoot + path;
  }
  return path;
}

// either bare e.g. readme.md or suffixed e.g. blah-demo.mp4
// and only in root folder
function findSpecialFile(suffix: string, files: FileInfo[]) {
  const regex = new RegExp(`(^([^/]+-)?${suffix}$)`, "i");
  const file = files.find((f) => regex.test(f.path));
  return file?.url ?? null;
}
