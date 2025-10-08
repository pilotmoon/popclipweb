---
titleTemplate: :title — PopClip Developer
---

# Script variables

When calling a script from a PopClip extension, the script receives a set of
variables that describe the context in which the action was triggered. These
variables are available in JavaScript, Shell Script, and AppleScript actions.

## JavaScript variables

In JavaScript, you access variables as properties under the `popclip` global.
See:

- [`popclip.input`](https://pilotmoon.github.io/popclip-types/interfaces/Input.html)
  (e.g. `popclip.input.text`)
- [`popclip.context`](https://pilotmoon.github.io/popclip-types/interfaces/Context.html)
  (e.g. `popclip.context.browserUrl`)
- [`popclip.options`](https://pilotmoon.github.io/popclip-types/interfaces/Options.html)
- [`popclip.modifiers`](https://pilotmoon.github.io/popclip-types/interfaces/Modifiers.html)

See also [JavaScript environment](https://www.popclip.app/dev/js-environment).

## Shell Script and AppleScript variables

All values are provided as strings. Where no value is available, it will be set
to an empty string.

Within a shell script, PopClip sets script variables named like this:
`POPCLIP_TEXT`, `POPCLIP_BROWSER_TITLE`, `POPCLIP_OPTION_FOO`, etc.

Within an AppleScript, PopClip pre-processes the script to replace placeholders
with strings. Placeholders look like this: `{popclip text}`,
`{popclip browser title}`, `{popclip option foo}`, etc.

### Available variables

| Name                   | Description                                                                                                                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`                 | The part of the selected plain text matching the specified regex or requirement.                                                                                                                                              |
| `full text`            | The selected plain text in its entirety.                                                                                                                                                                                      |
| `html`                 | Sanitized HTML for the selection. CSS is removed, potentially unsafe tags are removed and markup is corrected. (`Capture HTML` must be specified.)                                                                            |
| `urlencoded text`      | URL-encoded form of the matched text.                                                                                                                                                                                         |
| `raw html`             | The original unsanitized HTML, if available. (`Capture HTML` must be specified.)                                                                                                                                              |
| `markdown`             | A conversion of the HTML to Markdown. (`Capture HTML` must be specified.)                                                                                                                                                     |
| `urls`                 | Newline-separated list of web URLs that PopClip detected in the selected text.                                                                                                                                                |
| `modifier flags`       | Modifier flags for the keys held down when the extension's button was clicked in PopClip. Values are as defined in [Modifier values](#modifier-values). For example, `0` for no modifiers, or `131072` if shift is held down. |
| `bundle identifier`    | Bundle identifier of the app the text was selected in. For example, `com.apple.Safari`.                                                                                                                                       |
| `app name`             | Name of the app the text was selected in. For example, `Safari`.                                                                                                                                                              |
| `browser title`        | The title of the web page that the text was selected from. (Supported browsers only.)                                                                                                                                         |
| `browser url`          | The URL of the web page that the text was selected from. (Supported browsers only.)                                                                                                                                           |
| `option *`             | One such value is generated for each option specified in the extension's `options`, where `*` represents the option's `identifier`. For boolean options, the value will be a string, either `0` or `1`.                       |
| `extension identifier` | This extension's identifier.                                                                                                                                                                                                  |
| `action identifier`    | The identifier specified in the action's configuration, if any.                                                                                                                                                               |

## Modifier values

This table gives the numeric value for every possible modifier combination.

| Keys | Value   |
| ---- | ------- |
| none | 0       |
| ⇧    | 131072  |
| ⌃    | 262144  |
| ⌃⇧   | 393216  |
| ⌥    | 524288  |
| ⌥⇧   | 655360  |
| ⌃⌥   | 786432  |
| ⌃⌥⇧  | 917504  |
| ⌘    | 1048576 |
| ⇧⌘   | 1179648 |
| ⌃⌘   | 1310720 |
| ⌃⇧⌘  | 1441792 |
| ⌥⌘   | 1572864 |
| ⌥⇧⌘  | 1703936 |
| ⌃⌥⌘  | 1835008 |
| ⌃⌥⇧⌘ | 1966080 |
