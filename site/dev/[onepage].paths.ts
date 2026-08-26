// The /dev/all route: the whole Developer Docs rendered as one
// VitePress page. The content is the same cleaned corpus that llmDocs.ts
// serves as /dev/all.md, but cleaned in "page" mode so VitePress renders
// containers, code groups and links natively.
import { devOnePageContent } from "../.vitepress/llmDocs.ts";

export default {
  async paths() {
    return [{ params: { onepage: "all" }, content: await devOnePageContent() }];
  },
};
