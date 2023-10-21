import { z } from "zod";
import { sha256 } from "js-sha256";
import { alphabets, baseEncode } from "@pilotmoon/chewit";

export type HexColor = string;

const colorRegex = /^#[0-9a-f]{6}$/;
const ZIconDescriptor = z.object({
  specifier: z.string().min(1),
  flipHorizontal: z.coerce.boolean().optional(),
  flipVertical: z.coerce.boolean().optional(),
  preserveColor: z.coerce.boolean().optional(),
  preserveAspect: z.coerce.boolean().optional(),
  scale: z.coerce.number().optional(),
  color: z.string().regex(colorRegex).optional(),
});
export type IconDescriptor = z.infer<typeof ZIconDescriptor>;

export const ZIcon = z.object({
  data: z.any(),
  contentType: z.enum(["image/png", "image/svg+xml"]),
  colorMode: z.enum(["intrinsic", "mask"]),
});
export type Icon = z.infer<typeof ZIcon>;

export type IconFactory = (
  descriptor: IconDescriptor,
) => Promise<Icon>;

function clampScale(scale: number) {
  return Math.min(Math.max(scale, 0.1), 10);
}

export function parseIconDescriptor(descriptor: unknown) {
  const parsed = ZIconDescriptor.parse(descriptor);
  if (parsed.scale) {
    parsed.scale = clampScale(parsed.scale);
  }
  return parsed;
}

// Turn descriptor into a query string.
// The string is sorted so that the same descriptor always produces the same string.
// This can be used both as a cache key and as a URL query string.
// Only non-default properties are included. This allows new properties to be added in future without changing existing keys.
// Note that the order of the query string is important, so that the same descriptor always produces the same string.
export function querifyDescriptor(
  descriptor: IconDescriptor,
  includeColor = true,
) {
  const query = new URLSearchParams();
  query.append("specifier", descriptor.specifier);
  for (
    const key of [
      "flipHorizontal",
      "flipVertical",
      "preserveColor",
      "preserveAspect",
    ] as const
  ) {
    if (descriptor[key]) {
      query.append(key, "1");
    }
  }
  if (descriptor.scale) {
    const fixedScale = clampScale(descriptor.scale).toFixed(2);
    if (fixedScale !== "1.00") {
      query.append("scale", fixedScale);
    }
  }
  if (includeColor && descriptor.color && descriptor.color !== "#000000") {
    query.append("color", descriptor.color);
  }
  return query;
}

export function calculateIconKey(descriptor: IconDescriptor) {
  const hash = sha256.create().update(
    querifyDescriptor(descriptor, false).toString(),
  );
  let key = "i" + baseEncode(hash.array(), alphabets.base62).slice(-13);
  if (descriptor.color) {
    key += `-${descriptor.color.slice(1)}`;
  }
  console.log("key", key);
  return key;
}
