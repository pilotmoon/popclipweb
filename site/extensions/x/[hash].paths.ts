import { load } from "../../components/data/extensions-loader.js";

export default {
  async paths() {
    console.log("calling load from paths");
    const { extensions } = await load();
    return extensions.map((ext) => {      
      return {
        params: ext
      };
    })
  }
}