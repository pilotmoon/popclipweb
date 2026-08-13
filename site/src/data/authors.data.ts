import { defineLoader } from "vitepress";
import { type AuthorInfo, load } from "./authorInfo.ts";

// the vitepress whizzery
declare const data: AuthorInfo[];
export { data };
export default defineLoader({ load });
