// Pure helpers for linking to author pages, safe to import from client
// components. Deliberately separate from authorInfo.ts: that module
// imports the API client, whose top level throws without the API key --
// fine in a build-time loader, fatal when evaluated in the browser.

import * as config from "../config/config.json";
import type { AuthorInfo } from "./authorInfo.ts";

// extensions from our own account are the directory's own and are not
// attributed to an author: the record only tells us who owns the repo,
// and many extensions in PopClip-Extensions were written by other
// people, so naming us would take their credit. keyed on the github id,
// which (unlike the handle) can't change under us.
export function isOwnAuthor(author: Pick<AuthorInfo, "githubId">) {
  return author.githubId === config.pilotmoon.ownerGithubId;
}

// the name to show for an author, falling back to their handle
export function authorName(author: Pick<AuthorInfo, "name" | "githubHandle">) {
  return author.name || author.githubHandle;
}

// the public page path for an author, e.g. "/extensions/authors/ttscoff",
// a leaf of the same subtree as the authors index
export function authorPath(author: Pick<AuthorInfo, "shortcode">) {
  return `/extensions/authors/${author.shortcode}`;
}

// look up an author by the owner tag carried on an extension
export function authorByOwner(authors: AuthorInfo[], owner?: string | null) {
  const githubId = Number(owner?.match(/^github:(\d+)$/)?.[1]);
  return githubId
    ? (authors.find((a) => a.githubId === githubId) ?? null)
    : null;
}
