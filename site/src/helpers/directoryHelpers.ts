import type { ExtInfo } from "../data/extensions.data";
import config from "../config/config.json";

export function downloadUrl(ext: ExtInfo) {
  return `${config.pilotmoon.publicRoot}/extensions/x/${ext.shortcode}/${ext.version}/file`;
}
