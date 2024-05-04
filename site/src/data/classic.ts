import { z } from "zod";
import classics from "./classic-extensions.json";

const ZClassicExtension = z.object({
  handle: z.string(),
  name: z.string().nullable(),
  identifier: z.string().nullable(),
  date: z.number().int().safe().nonnegative()
});
type ClassicExtension = z.infer<typeof ZClassicExtension>;

let classicExtensionsMap: Map<string, ClassicExtension>;
export function classicExtensions() {
  if (!classicExtensionsMap) {
    classicExtensionsMap = new Map();
    for (const info of z.array(ZClassicExtension).parse(classics)) {
      if (info.identifier) {
        classicExtensionsMap.set(info.identifier, info);
      }
    }
  }
  return classicExtensionsMap;
}
