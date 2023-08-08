import { loadIndex, ExtensionsData } from "./extensions-loader.js";
import { defineLoader } from "vitepress";

declare const data: ExtensionsData;
export { data };
export default defineLoader({
  load: loadIndex
});