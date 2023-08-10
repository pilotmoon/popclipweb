import { Extension, loadPages } from "../../components/data/extensions-loader.js";

declare const paths: Extension[];
export { paths };

export default {
  async paths() {
    console.log("calling load from paths");
    const extensions = await loadPages();
    return extensions.map((ext) => {
      return {
        params: ext
      };
    })
  }
}