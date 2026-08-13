import { type AuthorInfo, load } from "../../src/data/authorInfo.ts";

declare const paths: AuthorInfo[];
export { paths };

// Note: the param is named `slug`, not `shortcode`, to keep it distinct
// from the extension route's `[shortcode]`.
export default {
  async paths() {
    const authors = await load();
    return authors.map((author) => ({
      params: { ...author, slug: author.shortcode },
    }));
  },
};
