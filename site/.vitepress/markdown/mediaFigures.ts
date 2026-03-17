import type MarkdownIt from "markdown-it";

// Promote standalone captioned audio/video markdown from paragraph-wrapped
// inline media into block-level <figure><figcaption> output.
const MEDIA_TYPES = new Set(["audio", "video"]);

function getStandaloneMediaToken(inlineToken: {
  children?: Array<{
    type: string;
    attrs?: [string, string][];
    attrGet?: (name: string) => string | null;
  }>;
}) {
  const children = inlineToken.children;
  if (!children) {
    return;
  }

  if (children.length === 1 && MEDIA_TYPES.has(children[0].type)) {
    return children[0];
  }

  if (
    children.length === 3 &&
    children[0].type === "link_open" &&
    MEDIA_TYPES.has(children[1].type) &&
    children[2].type === "link_close"
  ) {
    return children[1];
  }
}

function removeAttr(token: { attrs?: [string, string][] }, name: string): void {
  if (!token.attrs) {
    return;
  }

  token.attrs = token.attrs.filter(([attrName]) => attrName !== name);
}

export default function mediaFigures(md: MarkdownIt): void {
  md.core.ruler.after("image_figures", "media_figures", (state) => {
    for (let i = 1; i < state.tokens.length - 1; i++) {
      const inlineToken = state.tokens[i];
      if (inlineToken.type !== "inline") {
        continue;
      }

      const openingToken = state.tokens[i - 1];
      const closingToken = state.tokens[i + 1];
      if (
        openingToken.type !== "paragraph_open" ||
        closingToken.type !== "paragraph_close"
      ) {
        continue;
      }

      const mediaToken = getStandaloneMediaToken(inlineToken);
      const title = mediaToken?.attrGet?.("title");
      if (!mediaToken || !title) {
        continue;
      }

      openingToken.type = "figure_open";
      openingToken.tag = "figure";
      closingToken.type = "figure_close";
      closingToken.tag = "figure";

      removeAttr(mediaToken, "title");

      const caption = md.parseInline(title, state.env)[0]?.children ?? [];
      inlineToken.children ??= [];
      inlineToken.children.push(
        new state.Token("figcaption_open", "figcaption", 1),
        ...caption,
        new state.Token("figcaption_close", "figcaption", -1),
      );
    }
  });
}
