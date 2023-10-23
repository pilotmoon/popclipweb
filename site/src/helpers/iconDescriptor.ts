import { z } from "zod";

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

export function parseDescriptor(descriptor: unknown) {
  return ZIconDescriptor.parse(descriptor);
}

function clampScale(scale: number) {
  return Math.min(Math.max(scale, 0.1), 10);
}

// Remove any properties that are the same as the default.
// Also clamp scale to 0.1-10 and round to 2 decimal places.
function standardizeDescriptor(d: IconDescriptor) {
  if (d.color === "#000000") {
    delete d.color;
  }
  if (d.flipHorizontal === false) {
    delete d.flipHorizontal;
  }
  if (d.flipVertical === false) {
    delete d.flipVertical;
  }
  if (d.preserveColor === false) {
    delete d.preserveColor;
  }
  if (d.preserveAspect === false) {
    delete d.preserveAspect;
  }
  if (typeof d.scale === "number") {
    d.scale = Number(clampScale(d.scale).toFixed(2));
  }
  if (d.scale === 1) {
    delete d.scale;
  }
  return d;
}

// Turn descriptor into a query string.
// The keys are arranged in a consistent order.
// This can be used both as a cache key and as a URL query string.
export function querifyDescriptor(descriptor: IconDescriptor) {
  const query: string[] = [];
  descriptor = standardizeDescriptor(descriptor);
  for (
    // the order of the keys is important
    const key of [
      "specifier",
      "color",
      "flipHorizontal",
      "flipVertical",
      "preserveAspect",
      "preserveColor",
      "scale",
    ] as const
  ) {
    const value = descriptor[key];
    if (typeof value === "boolean") {
      query.push(`${key}=${value ? "1" : "0"}`);
    } else if (typeof value === "number") {
      query.push(`${key}=${value.toFixed(2)}`);
    } else if (typeof value === "string") {
      query.push(`${key}=${value}`);
    }
  }
  return query.join("&");
}
