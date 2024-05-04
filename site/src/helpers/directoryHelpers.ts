import type { ExtInfo } from "../data/extensions.data";

export function downloadUrl(ext: ExtInfo) {
  return `https://pilotmoon.com/popclip/extensions/${ext.shortcode}.popclipextz`;
}
