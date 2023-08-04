import { defineLoader } from "vitepress";
import { z } from "zod";
import { alphabets, baseDecode, baseEncode } from "@pilotmoon/chewit";
import { createHash } from "node:crypto";

// simple sha256 wrapper that generates a hex string
export function sha256Base(message: string) {
  return baseEncode(Array.from(createHash("sha256").update(message).digest()), alphabets.base58Flickr);
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
      "https://pilotmoon.com/popclip/extensions/extensions.json?jwegrjhg",
    );
    const data = await response.json();
    const hashes = new Set<string>();
    const extensions = data
      .map((extension: any) => {
        const hash = "1" + sha256Base(extension.handle).substring(0, 4);
        if (hashes.has(hash)) {
          throw new Error(`Duplicate hash: ${hash} for ${extension.handle}`);
        }
        hashes.add(hash);
        return ZExtension.safeParse({...extension, hash})
      })
      .filter((result) => result.success)
      .map((result) => result.data );
    const result = { extensions };
    return result;
  },
});
