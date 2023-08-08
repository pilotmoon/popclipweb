import { z } from "zod";
import { alphabets, baseEncode } from "@pilotmoon/chewit";
import { createHash } from "node:crypto";
import {
  canonicalize,
  generateKey,
  IconDescriptor,
  IconKey,
} from "../helpers/iconKeyBrowser.js";
import { omit } from "lodash"

import * as config from "../../config.json";

// simple sha256 wrapper that generates a hex string
export function sha256Base(message: string) {
  return baseEncode(
    Array.from(createHash("sha256").update(message).digest()),
    alphabets.base58Flickr,
  );
}

export const ZExtension = z.object({
  identifier: z.string(), // e.g. com.pilotmoon.select-all
  handle: z.string(), // e.g. SelectAll
  shortcode: z.string(), // eg 1sA3e
  name: z.string(), // extension name
  description: z.string(),
  size: z.number(),
  downloadUrl: z.string().url(),  
  iconSpecifier: z.string().nullish(),
  iconUrlWhite: z.string().url().nullish(),
  iconUrlBlack: z.string().url().nullish(),
  note: z.string().nullable().nullish(),
  timestamp: z.number().int().positive(),
  demogif: z.string().url().nullish(),
  readme: z.string().nullish(),
});

export type Extension = z.infer<typeof ZExtension>;
export interface ExtensionsData {
  extensions: Record<string, Extension>; // map of identifier to extension
  index: Section[];
}

export type Section = {
  title: string;
  members: string[]; // will be the hash
};

export async function loadIndex(): Promise<ExtensionsData> {
  const { extensionsArray, index } = await load();
  const extensions: Record<string, Extension> = {};
  for (const ext of extensionsArray) {
    extensions[ext.identifier] = omit(ext, ["readme"]); // don't need it for index
  }
  return { extensions, index };
}

export async function loadPages(): Promise<Extension[]> {
  const { extensionsArray } = await load();
  return extensionsArray;
}

let savedResult: { extensionsArray: Extension[]; index: Section[] };

let count = 0;
export async function load(): Promise<
  { extensionsArray: Extension[]; index: Section[] }
> {
  console.log("!!load called!!", ++count);
  if (savedResult) {
    console.log("returning saved result");
    return savedResult;
  }
  const extensionsArray = await processExtensions();
  const index = await processIndex(extensionsArray);
  savedResult = { extensionsArray, index };
  return savedResult;
}

async function processIndex(extensions: Extension[]): Promise<Section[]> {
  const rawIndex = await (await fetch(
    "https://pilotmoon.com/popclip/extensions/index.json",
  )).json();

  // make a lookup table mapping handle to identifier
  const handleToIdentifier: Record<string, string> = {};
  for (const ext of extensions) {
    handleToIdentifier[ext.handle] = ext.identifier;
  }

  // re-make the index replacing the handles with identifiers
  const result: Section[] = [];
  for (const section of rawIndex) {
    const members: string[] = [];
    for (const handle of section.Members) {
      const identifier = handleToIdentifier[handle];
      if (identifier) {
        members.push(identifier);
      } else {
        console.log(`Missing identifier for ${handle}`);
      }
    }
    result.push({ title: section.Title, members });
  }
  return result;
}

async function processExtensions() {
  const response = await fetch(
    "https://pilotmoon.com/popclip/extensions/extensions.json",
  );
  const extensionsArray = await response.json();
  const shortcodes = new Set<string>();
  const result: Extension[] = [];

  const crumbs: {
    descriptor: IconDescriptor;
    key: IconKey;
    url: string;
  }[] = [];
  async function generateIconUrls(imageUrl: string) {
    const result = { black: undefined, white: undefined };
    if (imageUrl) {
      for (const color of ["black", "white"]) {
        const descriptor = canonicalize({ specifier: imageUrl, color });
        const key = await generateKey(descriptor);
        const cdnUrl = config.pilotmoon.cdnRoot + "/icons/" + key.opaque;
        const spacesUrl = config.pilotmoon.spacesRoot + "/icons/" +
          key.opaque;
        result[color] = cdnUrl;
        crumbs.push({ descriptor, key, url: spacesUrl });
      }
    }
    return result;
  }

  for (const extension of extensionsArray) {
    if (!extension.identifier) {
      // console.log(`Missing identifier for ${extension.handle}`);
      continue;
    }
    let shortcode: any = "1" + sha256Base(extension.identifier).substring(0, 4);
    if (shortcodes.has(shortcode)) {
      console.log(`Duplicate shortcode: ${shortcode} for ${extension.handle}`);
      continue;
    }
    const { black: imageLight, white: imageDark } = await generateIconUrls(
      extension.image,
    );
    shortcodes.add(shortcode);
    const parsed = ZExtension.safeParse({
      ...extension,
      name: extension.title,
      shortcode,
      iconSpecifier: extension.image,
      iconUrlWhite: imageDark,
      iconUrlBlack: imageLight,      
      downloadUrl: extension.download,
      timestamp: extension.date,
    });
    if (parsed.success) {
      result.push(parsed.data);
    }
  }

  // await Promise.all(
  //   crumbs.map(({ descriptor, key, url }) => postIcon(descriptor, url)),
  // ).then(() => {
  //   console.log("done posting icons");
  // });

  return result;
}

async function postIcon(
  descriptor: IconDescriptor,
  url: string,
) {
  // check if icon exists in cdn
  try {
    const cdnResponse = await fetch(url);
    if (cdnResponse.ok) {
      console.log("icon exists in space", url);
      return;
    }
  } catch (e) {
    console.log("fetch exception", e);
  }
  console.log("icon does not exist in space", url);
  // post icon to cdn

  try {
    let apiRoot = config.pilotmoon.apiRoot;
    const apiResponse = await fetch(
      apiRoot + "/frontend/icon",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(descriptor),
      },
    );
    if (!apiResponse.ok) {
      console.log("icon post failed", url);
      return;
    }
    console.log("icon post succeeded", url);
  } catch (e) {
    console.log("fetch exception", e);
  }
}
