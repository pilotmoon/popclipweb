import { z } from "zod";

export type HexColor = string;

const colorRegex = /^#[0-9a-f]{6}$/;
const ZIconDescriptor = z.object({
  specifier: z.string().min(1),
  color: z.string().regex(colorRegex).optional(),
  preserveColor: z.coerce.boolean().optional(),
  preserveAspect: z.coerce.boolean().optional(),  
});
export type IconDescriptor = z.infer<typeof ZIconDescriptor>;

// Turn descriptor into a query string.
// The keys are arranged in a consistent order.
// This can be used both as a cache key and as a URL query string.
export function querifyDescriptor(descriptor: IconDescriptor, cacheKey = "") {
  const query: string[] = [];
  const params = new Map(Object.entries(descriptor));
  if (params.get('color') === "#000000") {
    params.delete('color');
  }
  if (cacheKey) {
    params.set("cacheKey", cacheKey);
  }
  console.log(params);
  for (const key of [...params.keys()].sort()) {
    const value = params.get(key);
    if (typeof value === "boolean") {
      query.push(`${key}=${value ? "1" : "0"}`);
    } else if (typeof value === "string") {
      query.push(`${key}=${encodeURIComponent(value)}`);
    }
  }
  return query.join("&");
}
