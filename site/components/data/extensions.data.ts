import { defineLoader } from "vitepress";
import { z } from "zod";
import { alphabets, baseEncode } from "@pilotmoon/chewit";
import { createHash } from "node:crypto";
import {
  canonicalize,
  generateKey,
  IconDescriptor,
  IconKey,
} from "../helpers/iconKeyBrowser.js";
import * as config from "../../config.json";

// simple sha256 wrapper that generates a hex string
export function sha256Base(message: string) {
  return baseEncode(
    Array.from(createHash("sha256").update(message).digest()),
    alphabets.base58Flickr,
  );
}

export const ZExtension = z.object({
  handle: z.string(),
  hash: z.string(),
  title: z.string(),
  identifier: z.string(),
  description: z.string(),
  download: z.string().url(),
  size: z.number(),
  image: z.string().url().nullish(),
  imageDark: z.string().nullish(),
  imageLight: z.string().nullish(),
  note: z.string().nullable().nullish(),
  demogif: z.string().url().nullish(),
  readme: z.string().nullish(),
});

export type Extension = z.infer<typeof ZExtension>;

export interface ExtensionsData {
  extensions: Extension[];
}

declare const data: ExtensionsData;
export { data };

export default defineLoader({
  async load(): Promise<ExtensionsData> {
    const response = await fetch(
      "https://pilotmoon.com/popclip/extensions/extensions.json",
    );
    const extensionsArray = await response.json();
    const hashes = new Set<string>();
    const result: Extension[] = [];

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

    async function generateIconUrls(imageUrl: string) {
      const crumbs: {
        descriptor: IconDescriptor;
        key: IconKey;
        url: string;
      }[] = [];
      const result = { black: undefined, white: undefined };
      if (imageUrl) {
        for (const color of ["black", "white"]) {
          const descriptor = canonicalize({ specifier: imageUrl, color });
          const key = await generateKey(descriptor);
          const cdnUrl = config.pilotmoon.cdnRoot + "/icons/" + key.opaque;
          const spacesUrl = config.pilotmoon.spacesRoot + "/icons/" + key.opaque;
          result[color] = cdnUrl;          
          crumbs.push({ descriptor, key, url: spacesUrl });
        }
      }
      Promise.all(
        crumbs.map(({ descriptor, key, url }) => postIcon(descriptor, url)),
      );
      return result;
    }

    for (const extension of extensionsArray) {
      if (!extension.identifier) {
        console.log(`Missing identifier for ${extension.handle}`);
        continue;
      }
      let hash: any = "1" + sha256Base(extension.identifier).substring(0, 4);
      if (hashes.has(hash)) {
        console.log(`Duplicate hash: ${hash} for ${extension.handle}`);
        continue;
      }
      const { black: imageLight, white: imageDark } = await generateIconUrls(
        extension.image,
      );
      hashes.add(hash);
      const parsed = ZExtension.safeParse({
        ...extension,
        hash,
        imageDark,
        imageLight,
      });      
      if (parsed.success) {
        result.push(parsed.data);
      }
    }
    return { extensions: result };
  },
});
