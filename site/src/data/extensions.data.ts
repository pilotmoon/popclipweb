import { defineLoader } from "vitepress";
import { load, type ExtInfo } from "./extensionInfo.ts";

// the vitepress whizzery
declare const data: ExtInfo[];
export { data };
export default defineLoader({ load });

