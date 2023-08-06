import { defineLoader } from "vitepress";
import { z } from "zod";
import { alphabets, baseEncode } from "@pilotmoon/chewit";
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
  iconspec: z.string().nullish(),
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
    const data = await response.json();
    const hashes = new Set<string>();
    const extensions = data      
      .flatMap((extension: any) => {
        if (!extension.identifier) {
          console.log(`Missing identifier for ${extension.handle}`);
          return [];
        }
        let hash: any = "1" + sha256Base(extension.identifier).substring(0, 4);
        if (hashes.has(hash)) {
          console.log(`Duplicate hash: ${hash} for ${extension.handle}`);
          return [];
        }
        let iconspec = null;
        const folder="https://pilotmoon.com/popclip/extensions/icon/";
        if (extension.image?.startsWith(folder)) {
          iconspec=extension.image.replace(folder, "pcx:");
        }
        console.log(`iconspec: ${iconspec} for ${extension.handle}`);
        hashes.add(hash);
        return [ZExtension.safeParse({...extension, hash, iconspec})]
      })
      .filter((result) => result.success)
      .map((result) => result.data );
    const result = { extensions };
    return result;
  },
});
