import { createHash } from "node:crypto";
import { alphabets, baseEncode } from "@pilotmoon/chewit";
import { z } from "zod";

const API_KEY=process.env.PILOTMOON_API_KEY;
if (!API_KEY) {
  throw new Error("Missing PILOTMOON_API_KEY");
}

export function sha256Base58(message: string) {
  return baseEncode(
    Array.from(createHash("sha256").update(message).digest()),
    alphabets.base58Flickr,
  );
}

export function sha256Base32(message: string) {
  return baseEncode(
    Array.from(createHash("sha256").update(message).digest()),
    alphabets.base32Crockford,
  ).toLowerCase();
}

export const ZExtension = z.object({
  identifier: z.string(), // e.g. com.pilotmoon.select-all
  handle: z.string(), // e.g. SelectAll
  shortcode: z.string(), // eg 1sA3e
  name: z.string(), // extension name
  description: z.string(),
  size: z.number(),
  downloadUrl: z.string().url(),
  repoUrl: z.string().url(),
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
    const extCopy = { ...ext };
    extCopy.readme = undefined;
    extCopy.demogif = undefined;
    extensions[ext.identifier] = extCopy;
  }
  return { extensions, index };
}

export async function loadPages(): Promise<Extension[]> {
  const { extensionsArray } = await load();
  return extensionsArray;
}

let savedResult: { extensionsArray: Extension[]; index: Section[] };

let count = 0;
export async function load(): Promise<{
  extensionsArray: Extension[];
  index: Section[];
}> {
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
  const rawIndex = await (
    await fetch("https://pilotmoon.com/popclip/extensions/index.json")
  ).json();

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

  for (const extension of extensionsArray) {
    if (!extension.identifier) {
      // console.log(`Missing identifier for ${extension.handle}`);
      continue;
    }
    const oldShortcode: any = `1${sha256Base58(extension.identifier).substring(
      0,
      4,
    )}`;
    const shortcode = sha256Base32(extension.identifier).slice(-6);
    if (shortcodes.has(shortcode)) {
      console.log(`Duplicate shortcode: ${shortcode} for ${extension.handle}`);
      continue;
    }
    //console.log(`    /extensions/x/${oldShortcode} /extensions/x/${shortcode};`);

    shortcodes.add(shortcode);
    const parsed = ZExtension.safeParse({
      ...extension,
      name: extension.title,
      shortcode,
      iconSpecifier: extension.image,
      downloadUrl: extension.download,
      timestamp: extension.date,
      repoUrl: `https://github.com/pilotmoon/PopClip-Extensions/tree/master/source/${extension.handle}.popclipext`,
    });
    if (parsed.success) {
      result.push(parsed.data);
    }
  }
  
  return result;
}
