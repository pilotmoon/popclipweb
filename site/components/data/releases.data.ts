import { defineLoader } from 'vitepress'
import axios from "axios";
import { z } from 'zod'

export const ZRelease = z.object({  
  versionString: z.string(),
  date: z.string(),
  description: z.string(),
  
  version: z.number().int().nullish(),
  url: z.string().url().nullish(),
  size: z.number().int().nullish(),
  pin: z.boolean().nullish(), // pin means should be make available for download
  zap: z.boolean().nullish(), // zap means do not make available for download (e.g. has a bug)
  minimumSystemVersion: z.string().nullish(),
  archs: z.array(z.string()).nullish(),
  eddsaSignature: z.string().nullish(),

});
export type Release = z.infer<typeof ZRelease>

export const ZReleases = z.array(ZRelease);
export type Releases = z.infer<typeof ZReleases>

export interface Data {
  production: Releases
  beta: Releases
}

declare const data: Data
export { data }

export default defineLoader({
  async load(): Promise<Data> {
    // use respective CMS client library if needed
    const { data: dataProd } = await axios.get(
      "https://pilotmoon.com/popclip/releases.json",
    );
    const { data: dataBeta } = await axios.get(
      "https://pilotmoon.com/popclip/releases-beta.json",
    );
    const result = {
        production: ZReleases.parse(dataProd),
        beta: ZReleases.parse(dataBeta),
    };
    return result;
  }
});
