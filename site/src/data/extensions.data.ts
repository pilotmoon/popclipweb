import { defineLoader } from "vitepress";
import { z } from "zod";
import axios from "axios";
import { classicExtensions } from "./classic.ts";
import * as config from "../config/config.json";

// the vitepress whizzery
declare const data: ExtInfo[];
export { data };
export default defineLoader({ load });

// what we get back from the extensions endpoint of the API
const ZAppInfo = z.object({ name: z.string(), link: z.string() });
export type AppInfo = z.infer<typeof ZAppInfo>;
const ZFileInfo =     z.object({
  path: z.string(),
  url: z.string(),
  executable: z.boolean().optional(),
});
export type FileInfo = z.infer<typeof ZFileInfo>;
const ZExtInfo = z.object({
  id: z.string(),
  created: z.coerce.date(),
  firstCreated: z.coerce.date(),
  shortcode: z.string(),
  identifier: z.string(),
  version: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  description: z.string(),
  keywords: z.string(),
  apps: z.array(ZAppInfo),
  demo: z.string().nullable(),
  readme: z.string().nullable(),
  source: z.string().nullable(),
  // owner: z.string().nullable(),
  files: z.array(ZFileInfo),
});
export type ExtInfo = z.infer<typeof ZExtInfo>;

// prepare api access
const PILOTMOON_API_KEY = process.env.PILOTMOON_API_KEY;
if (!PILOTMOON_API_KEY) {
  throw new Error("Missing PILOTMOON_API_KEY");
}
const api = axios.create({
  baseURL: "https://pltmn-rolo.eu.ngrok.io",
  headers: {
    Authorization: `Bearer ${PILOTMOON_API_KEY}`,
  },
});

export async function load() {
  console.log("In extensions loader");
  console.time("load extensions");
  let cursor: string | undefined;
  const exts: ExtInfo[] = [];
  do {
    const response = await api.get("extensions", {
      params: {
        view: "popclip",
        version: "latest",
        format: "json",
        limit: 300,
        cursor,
      },
    });
    const parseResult = z.array(ZExtInfo).safeParse(response.data);
    if (!parseResult.success) {
      throw new Error("Failed to parse extensions info");
    }
    exts.push(...parseResult.data.map((ext) => ({
      ...ext, 
      firstCreated: adjustFirstCreated(ext.firstCreated, ext.identifier),
      description: linkifyDescription(ext.description, ext.apps),
      demo: adjustBlobPath(ext.demo),
      readme: adjustBlobPath(ext.readme),
    })));
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
      `<a href="${app.link}">${app.name}</a>`,
    );
  }
  return html;
}

// replace first created date with actual dates from the old extensions that predate the new backend
function adjustFirstCreated(date: Date, identifier: string) {
  const unixDate = classicExtensions().get(identifier)?.date
  return unixDate ? new Date(unixDate * 1000) : date;
}

// adjust blob paths to full URLs
function adjustBlobPath(path: string | null) {
  if (path?.startsWith("/")) {
    return config.pilotmoon.publicRoot + path;
  }
  return path;
}