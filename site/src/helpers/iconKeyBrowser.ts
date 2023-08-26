import { z } from "zod";
import { subtle } from "node:crypto";

async function sha256Base64Url(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashBase64 = btoa(hashArray.map((b) => String.fromCharCode(b)).join(""));
    return hashBase64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const ZIconDescriptor = z.object({
  specifier: z.string(),
  color: z.string().optional(),
});

export type IconDescriptor = z.infer<typeof ZIconDescriptor>;
export type IconKey = { opaque: string; raw: string };

export async function generateKey(
  descriptor: IconDescriptor,
): Promise<IconKey> {
  const raw ="4" + JSON.stringify(descriptor);
  return { opaque: (await sha256Base64Url(raw)).substring(0, 24), raw };
}

export function canonicalize(
  descriptor: IconDescriptor,
): IconDescriptor {
  return { ...descriptor, color: canonicalizeColor(descriptor.color) };
}

function canonicalizeColor(color: any): string | undefined {
  if (typeof color === "string") {
    color = color.trim();
    color = color.toLowerCase();
    if (color === "black") {
      return "#000000";
    }
    if (color === "white") {
      return "#ffffff";
    }
    if (color.startsWith("#")) {
      color = color.substring(1);
    }
    if (color.match(/^[0-9a-f]{6}$/i)) {
      return "#" + color;
    }
    if (color.match(/^[0-9a-f]{3}$/i)) {
      return "#" + color[0] + color[0] + color[1] + color[1] + color[2] +
        color[2];
    }
  }
}
