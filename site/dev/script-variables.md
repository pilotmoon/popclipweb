---
titleTemplate: :title — PopClip Developer
---

# Script variables

When calling a shell script or AppleScript from a classic PopClip script action (not from JavaScript),
the script receives a set of variables that describe the input text and the context in which the action was triggered.

::: info Variables in JavaScript

In JavaScript, variables are on the [`popclip` global object](js-environment).

:::

## Shell Script variables

All values are provided as strings. Where no value is available, it will be set
to an empty string.

Within a shell script, PopClip sets script variables named like this:
`POPCLIP_TEXT`, `POPCLIP_BROWSER_TITLE`, `POPCLIP_OPTION_FOO`, etc.

Example of using variables in a shell script:

```shell
open "https://translate.google.com/?text=${POPCLIP_URLENCODED_TEXT}"
```

## AppleScript variables

Within an AppleScript, PopClip pre-processes the script to replace placeholders
with strings. Placeholders look like this: `{popclip text}`,
`{popclip browser title}`, `{popclip option foo}`, etc.

Example of using placeholders in an AppleScript:

```applescript
display dialog "{popclip text}" with title "Selected in {popclip app name}"
```

## Available variables

<ScriptVariablesTable />

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
