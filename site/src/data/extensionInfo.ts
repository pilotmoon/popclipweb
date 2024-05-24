import { z } from "zod";
import { classicExtensions } from "./classic.ts";
import * as config from "../config/config.json";
import { api } from "./pilotmoonApi.ts";
import sanitizeHtml from "sanitize-html";
import { gh } from "./gh.ts";
import { type Data as ReleasesData, load as loadReleases, type Release } from './releases.data';

// what we get back from the extensions endpoint of the API
const ZAppInfo = z.object({ name: z.string(), link: z.string() });
export type AppInfo = z.infer<typeof ZAppInfo>;

const ZFileInfo = z.object({
  path: z.string(),
  url: z.string(),
  executable: z.boolean().optional(),
});
export type FileInfo = z.infer<typeof ZFileInfo>;

const ZLicenseInfo = z.object({ name: z.string(), url: z.string() });
type LicenseInfo = z.infer<typeof ZLicenseInfo>;

const ZAltString = z.object({
  lang: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
});
const ZPartialExtInfo = z.object({
  version: z.string(),
  name: z.string(),
  source: z.string().nullable(),
  sourceDate: z.coerce.date().nullable(),
  sourceMessage: z.string().nullish(),
  download: z.string().nullable(),
});
export type PartialExtInfo = z.infer<typeof ZPartialExtInfo>;
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
  altStrings: z.array(ZAltString).nullable(),
  actionTypes: z.array(z.string()),
  entitlements: z.array(z.string()),
  macosVersion: z.string().nullable(),
  popclipVersion: z.number().nullable(),
  // extras that we add:
  demo: z.string().nullish(),
  readme: z.string().nullish(),
  filterTerms: z.string().nullish(),
  license: ZLicenseInfo.nullish(),
  popclipDisplayVersion: z.string().nullish(),
  popclipVersionIsBeta: z.boolean().nullish(),
});
export type ExtInfo = z.infer<typeof ZExtInfo>;

const ZGithubLicenseInfo = z.object({
  html_url: z.string(),
  license: z.object({
    name: z.string(),
  }),
});

const licenseCache = new Map<string, LicenseInfo>();
async function getLicenseInfo(ext: ExtInfo) {
  let info = { name: "MIT License", url: "/extensions/license" }; // default
  const repoId = ext.source?.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)/)
    ?.[1];
  if (repoId) {
    if (licenseCache.has(repoId)) {
      return licenseCache.get(repoId);
    }
    console.log(`Getting license info for ${repoId}`);
    const response = await gh.get(`repos/${repoId}/license`);
    const parseResult = ZGithubLicenseInfo.safeParse(response.data);
    if (parseResult.success) {
      info = {
        name: parseResult.data.license.name,
        url: parseResult.data.html_url,
      };
    }
    licenseCache.set(repoId, info);
  }
  return info;
}

let releasesCache: ReleasesData;
async function getDisplayVersion(ext: ExtInfo) {
  if (!releasesCache) {
    releasesCache = await loadReleases();
  }
  // find release that matches the extension version if any
  // if no exact match return lowest version that is higher than the extension version
  // if there is no next release return the build number
  if (ext.popclipVersion) {
    let nextRelease: Release | undefined;
    for (const release of releasesCache.production) {
      if (release.version === ext.popclipVersion) {
        return { versionString: release.versionString, isBeta: false };
      }
      if ((release.version ?? 0) > ext.popclipVersion) {
        if (!nextRelease || (release.version ?? 0) < (nextRelease.version ?? 0)) {
          nextRelease = release;
        }        
      }      
    }
    if (nextRelease) {
      return { versionString: nextRelease.versionString, isBeta: false };
    }
    return { versionString: `Build ${ext.popclipVersion}`, isBeta: true };
  }
  return { versionString: "", isBeta: false };
}

export async function load() {
  console.log("In extensions loader");
  console.time("load extensions");
  let cursor: string | undefined;
  const limit = 200;
  const exts: ExtInfo[] = [];
  do {
    const response = await api.get("extensions", {
      params: {
        view: "popclipDirectory",
        format: "json",
        limit,
        cursor,
      },
    });
    const parseResult = z.array(ZExtInfo).safeParse(response.data);
    if (!parseResult.success) {
      throw new Error("Failed to parse extensions info");
    }
    for (const ext of parseResult.data) {
      ext.name = sanitizeHtml(ext.name.trim());
      ext.firstCreated = adjustFirstCreated(ext.firstCreated, ext.identifier);
      // enforce period at end od description
      ext.description = `${
        sanitizeHtml(linkifyDescription(ext.description, ext.apps)).trim()
          .replace(/\.$/, "")
      }.`;
      ext.demo = adjustPublicPath(
        findSpecialFile("demo.mp4", ext.files) ??
          findSpecialFile("demo.gif", ext.files),
      );
      const { versionString, isBeta } = await getDisplayVersion(ext);
      ext.readme = adjustPublicPath(findSpecialFile("readme.md", ext.files));
      ext.download = adjustPublicPath(ext.download);
      ext.filterTerms = compileFilterTerms(ext);
      ext.license = await getLicenseInfo(ext);
      ext.actionTypes = adjustActionTypes(ext);
      ext.popclipDisplayVersion = versionString;
      ext.popclipVersionIsBeta = isBeta;
      for (const prev of ext.previousVersions) {
        prev.download = adjustPublicPath(prev.download);
        prev.name = sanitizeHtml(prev.name.trim());
      }
      exts.push(ext);
    }
    cursor = parseResult.data.length === limit
      ? parseResult.data[limit - 1].id
      : undefined;
  } while (cursor);
  console.log(`Loaded ${exts.length} extensions from the API`);
  console.timeEnd("load extensions");
  return exts;
}

function adjustActionTypes(ext: ExtInfo) {
  if (!ext.actionTypes.length) {
    return ["javascript"]; // fix for missing action type in some Config.js / Config.ts extensions
  }
  return ext.actionTypes;
}

function compileFilterTerms(ext: ExtInfo) {
  return [
    ext.name,
    ext.keywords,
    ext.apps.map((app) => app.name).join(" "),
    ext.altStrings?.map((alt) => alt.name).join(" "),
  ].join(" ").toLowerCase();
}

// replace app names with html link to apps
// also sanitize the html
function linkifyDescription(description: string, apps: AppInfo[]) {
  let html = description;
  for (const app of apps) {
    html = html.replace(
      new RegExp(`\\b${app.name}\\b`),
      `<a href="${app.link}">${app.name}</a>`,
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
