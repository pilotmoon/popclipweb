import { defineLoader } from "vitepress";
import { ExtensionsData, loadIndex } from "./extensions-loader.js";

declare const data: ExtensionsData;
export { data };
export default defineLoader({
  load: loadIndex,
});
