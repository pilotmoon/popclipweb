import { z } from "zod";
import { api } from "./pilotmoonApi.ts";

// Extension authors, as served by the directory view of the API. This is
// the public profile only -- the API never sends us contact details.

export const ZAuthorInfo = z.object({
  id: z.string(),
  // the author's page slug, e.g. "ttscoff"; ours, not github's
  shortcode: z.string(),
  githubId: z.number(),
  githubHandle: z.string(),
  githubType: z.enum(["User", "Organization"]),
  githubUrl: z.string(),
  avatarUrl: z.string(),
  name: z.string().nullable(),
  bio: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  verified: z.boolean(),
});
export type AuthorInfo = z.infer<typeof ZAuthorInfo>;

// note: link helpers live in authorLinks.ts, because this module pulls in
// the API client, whose top level throws without a key -- fine at build
// time, fatal if a client component ever imports it

export async function load(): Promise<AuthorInfo[]> {
  console.log("In authors loader");
  console.time("load authors");
  const authors: AuthorInfo[] = [];
  let cursor: string | undefined;
  const limit = 200;
  do {
    const response = await api.get("authors", {
      params: { view: "popclipDirectory", format: "json", limit, cursor },
    });
    const parseResult = z.array(ZAuthorInfo).safeParse(response.data);
    if (!parseResult.success) {
      throw new Error(`Failed to parse authors info: ${parseResult.error}`);
    }
    authors.push(...parseResult.data);
    cursor = parseResult.data.length === limit
      ? parseResult.data[limit - 1].id
      : undefined;
  } while (cursor);
  console.log(`Loaded ${authors.length} authors from the API`);
  console.timeEnd("load authors");
  return authors;
}
