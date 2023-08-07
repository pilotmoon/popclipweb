import { alphabets, baseEncode } from "@pilotmoon/chewit";
import { createHash } from "node:crypto";

// simple sha256 wrapper that generates a hex string
export function sha256Base(message: string) {
  return baseEncode(Array.from(createHash("sha256").update(message).digest()), alphabets.base58Flickr);
}


export default {
  async paths() {
    const exts = await (await fetch('https://pilotmoon.com/popclip/extensions/extensions.json')).json()

    return exts.flatMap((ext) => {
      if (!ext.identifier) {
        return [];
      }
      let hash: any = "1" + sha256Base(ext.identifier).substring(0, 4);
      return [{
        params: {
          shortcode: hash,
          title: ext.title,
        }
      }];
    })
  }
}