import { Extension, loadPages } from "../../src/data/extensions-loader.js";
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

declare const paths: Extension[];
export { paths };

// markdown rendering (with html passed through)
const md = new MarkdownIt({
  html: true,
});
function renderMarkdown(markdown: string) {
  //return markdown;
  let html = sanitizeHtml(md.render(markdown));

  // insert newline before these tags -- due to https://github.com/markdown-it/markdown-it/issues/951
  // (specifically these four as per https://spec.commonmark.org/0.30/#html-blocks)
  html = html.replace(/<pre/g, "\n<pre");  
  html = html.replace(/<script/g, "\n<script");  
  html = html.replace(/<style/g, "\n<style");  
  html = html.replace(/<textarea/g, "\n<textarea");  
  return html
}

export default {
  async paths() {
    console.log("calling load from paths");
    const extensions = await loadPages();
    return extensions.map((ext) => {
      const extCopy = { ...ext };
      delete extCopy.readme;      
      console.log("Rendering readme for extension", ext.name);
      return {
        params: extCopy,
        content: ext.readme ? renderMarkdown(ext.readme) : "",
      };
    })
  }
}