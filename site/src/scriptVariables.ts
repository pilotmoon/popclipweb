// The script variables table data, shared by ScriptVariablesTable.vue (the
// docs page's switchable table) and llmDocs.ts (which renders the same data
// as a static Markdown table for the page's twin). Descriptions are inline
// Markdown: backtick code spans and [label](target) links only.
//
// A variable's concrete name is derived from its generic key exactly as the
// app derives it (see PopShellScriptService.m / PopAppleScriptService.m).

export interface ScriptVariable {
  key: string;
  description: string;
}

export function shellVariableName(key: string): string {
  return `POPCLIP_${key.toUpperCase().split(" ").join("_")}`;
}

export function applescriptPlaceholder(key: string): string {
  return `{popclip ${key.toLowerCase()}}`;
}

export const scriptVariables: ScriptVariable[] = [
  {
    key: "text",
    description:
      "The part of the selected plain text matching the specified regex or requirement.",
  },
  {
    key: "full text",
    description: "The selected plain text in its entirety.",
  },
  {
    key: "html",
    description:
      "Sanitized HTML for the selection. CSS is removed, potentially unsafe tags are removed and markup is corrected. (`captureHtml` must be specified.)",
  },
  {
    key: "urlencoded text",
    description: "URL-encoded form of the matched text.",
  },
  {
    key: "raw html",
    description:
      "The original unsanitized HTML, if available. (`captureHtml` must be specified.)",
  },
  {
    key: "markdown",
    description:
      "A conversion of the HTML to Markdown. (`captureHtml` must be specified.)",
  },
  {
    key: "urls",
    description:
      "Newline-separated list of web URLs that PopClip detected in the selected text.",
  },
  {
    key: "modifier flags",
    description:
      "Modifier flags for the keys held down when the extension's button was clicked in PopClip. Values are as defined in [Modifier values](#modifier-values). For example, `0` for no modifiers, or `131072` if shift is held down.",
  },
  {
    key: "bundle identifier",
    description:
      "Bundle identifier of the app the text was selected in. For example, `com.apple.Safari`.",
  },
  {
    key: "app name",
    description:
      "Name of the app the text was selected in. For example, `Safari`.",
  },
  {
    key: "browser title",
    description:
      "The title of the web page that the text was selected from. (Supported browsers only.)",
  },
  {
    key: "browser url",
    description:
      "The URL of the web page that the text was selected from. (Supported browsers only.)",
  },
  {
    key: "option *",
    description:
      "One such value is generated for each option specified in the extension's `options`, where `*` represents the option's `identifier`. For boolean options, the value will be a string, either `0` or `1`.",
  },
  {
    key: "extension identifier",
    description: "This extension's identifier.",
  },
  {
    key: "action identifier",
    description:
      "The identifier specified in the action's configuration, if any.",
  },
];
