import { Extension, loadPages } from "../../components/data/extensions-loader.js";
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import TurndownService from 'turndown';
var turndownService = new TurndownService({
  headingStyle: 'atx',
});


declare const paths: Extension[];
export { paths };

// markdown rendering (with html passed through)
const md = new MarkdownIt({
  html: true,
});
function renderMarkdown(markdown: string) {
  //return markdown;
  const html = sanitizeHtml(md.render(markdown));
  console.log(html);
  
  return html


  //return turndownService.turndown(html).trim();

}

export default {
  async paths() {
    console.log("calling load from paths");
    const extensions = await loadPages();
    return extensions.map((ext) => {
      //const extCopy = { ...ext };
      //delete extCopy.readme;      
      console.log("Rendering readme for extension", ext.name);
      return {
        params: { ...ext, readme: ext.readme ? renderMarkdown(ext.readme) : "no readme" },
        //content: ext.readme ? renderMarkdown(ext.readme) : "",
      };
    })
  }
}