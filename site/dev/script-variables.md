# Script variables

These string variables are available in [Shell Script actions](./shell-script-actions) and [AppleScript actions](./applescript-actions). Where no
value is available, it will be set to an empty string.

::: tip Referring to variables in scripts

- Within a shell script, the variables are named like this: `POPCLIP_TEXT`,
  `POPCLIP_BROWSER_TITLE`, `POPCLIP_OPTION_FOO` etc.

- Within an AppleScript, use placeholders like this: `{ popclip text }`,
  `{ popclip browser title }`, `{ popclip option foo }` etc.

:::

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

## Indicating errors

Scripts may indicate success or failure as follows:

| Result                                                                                                          | JavaScript                                                                                        | Shell Script  | AppleScript                                                           |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------- |
| Success                                                                                                         | Complete without throwing error.                                                                  | Exit code `0` | Complete without throwing error.                                      |
| General error. (PopClip will show an "X".)                                                                      | Throw any error. (Example: `throw new Error('message')`.)                                         | Exit code `1` | Throw error with any code. (Example: `error "message" number 501`.)   |
| Error with user's settings, or not signed in. (PopClip will show an "X" and pop up the extension's options UI.) | Throw error with specific message 'Not signed in'. (Example: `throw new Error('Not signed in')`.) | Exit code `2` | Throw error with code `502`. (Example: `error "message" number 502`.) |

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
