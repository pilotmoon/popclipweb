import { type AuthorInfo, load } from "../../src/data/authorInfo.ts";
import { load as loadExtensions } from "../../src/data/extensionInfo.ts";

declare const paths: AuthorInfo[];
export { paths };

// Note: the param is named `slug`, not `shortcode`, to keep it distinct
// from the extension route's `[shortcode]`.
export default {
  async paths() {
    const [authors, exts] = await Promise.all([load(), loadExtensions()]);
    // a page only for authors with at least one published extension,
    // matching the Authors Index filter -- author records exist from the
    // moment of submission, and a submission alone must not create a
    // public page
    const owners = new Set(
      exts
        .map((ext) => Number(ext.owner?.match(/^github:(\d+)$/)?.[1]))
        .filter((id) => id),
    );
    return authors
      .filter((author) => owners.has(author.githubId))
      .map((author) => ({
        params: { ...author, slug: author.shortcode },
      }));
  },
};
