import type { PopClipDirectoryView } from "../data/extensions.data";

export function downloadUrl(ext: PopClipDirectoryView) {
  return `https://pilotmoon.com/popclip/extensions/${ext.shortcode}.popclipextz`;
}
