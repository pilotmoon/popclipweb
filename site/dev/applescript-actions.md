---
titleTemplate: :title — PopClip Developer
---
# AppleScript actions

An AppleScript action runs AppleScript code. AppleScript's strength is in
automation, since it can be used to control other apps.

## Properties

An AppleScript action is defined by the presence of either an `applescript`,
`applescript file` field, with optional `applescript call` field, as follows:

| Key                | Type                  | Description                                                |
| ------------------ | --------------------- | ---------------------------------------------------------- |
| `applescript`      | String                | A text string to interpret directly as AppleScript source. |
| `applescript file` | String                | File name of an `.applescript` or `.scpt` file to run.     |
| `applescript call` | Dictionary (optional) | A named handler to call.                                   |

### The `applescript call` dictionary

The `applescript call` dictionary lets you call a named handler within the
script.

| Key          | Type             | Description                                                                                                                                                                                                                                                                           |
| ------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handler`    | String           | Name of a handler within the script to call.                                                                                                                                                                                                                                          |
| `parameters` | Array (optional) | Array of strings specifying names of values to pass as parameters to the handler, as defined in [Script variables](./script-variables.md). The number and order of parameters must match exactly what the handler expects to receive. Omit or leave empty if there are no parameters. |

### AppleScript format

PopClip can execute an AppleScript supplied either as a **plain text script**
(`.applescript` file), or as a **compiled script** (`.scpt` file, created in the
Script Editor app). The ways you can pass values to the script differ depending
on the script type (see examples below).

The script may optionally return a string (e.g. `return "foo"`), and act on it
with an `after` key. For returning errors, see
[Indicating Errors](#indicating-errors).

## Input and output

Within a plain text script, use `{popclip text}` as a placeholder for the
selected text. PopClip will replace the placeholder with the actual text before
executing the script. Other placeholders are also available; see
[Script variables](./script-variables.md).

Within a compiled script (`.scpt`), you cannot use placeholder strings. Instead,
you need to put your code in a handler and pass values to it. See
[Compiled `.scpt` file](#compiled-scpt-file) example.

Any text returned by the script will be made available to the `after` step.

## Indicating errors

AppleScripts should indicate success by exiting normally, and should indicate
failure by signalling an error. On error, PopClip will display the shaking-'X'.

To indicate an error with the user's settings, and pop up the extension's
options UI, signal the specific error code `502`. For example:

```applescript
error "Missing foo parameter" number 502
```

## Examples

### Snippet examples

Scripting another app:

```applescript
-- #popclip
-- name: LaunchBar
-- icon: LB
-- language: applescript
tell application "LaunchBar"
  set selection to "{popclip text}"
end tell
```

Returning text from the script:

```applescript
-- #popclip
-- name: AppleScript HTML
-- capture html: true
-- after: show-result
-- language: applescript
return "Your HTML: " & "{popclip html}"
```

### Package examples

#### Plain text `.applescript` file

::: code-group

```applescript [TextEditClip.applescript]
tell application "TextEdit"
 activate
 set theDocument to make new document
 set text of theDocument to ("{popclip text} - Clipped from {popclip browser url}")
end tell
```

```json [Config.json]
{
  "name": "TextEdit Clip",
  "applescriptFile": "TextEditClip.applescript"
}
```

:::

#### Compiled `.scpt` file

When using a `.scpt` file, parameters must be passed by calling a handler.

::: code-group

```applescript [TextEditClip.scpt]
on newDocument(theText, theUrl) --this is a handler
  tell application "TextEdit"
    activate
    set theDocument to make new document
    set text of theDocument to (theText & " - Clipped from " & theUrl)
  end tell
end newDocument
```

```json [Config.json]
{
  "name": "TextEdit Clip",
  "applescriptFile": "TextEditClip.scpt",
  "applescriptCall": {
    "handler": "newDocument",
    "parameters": ["text", "browser url"]
  }
}
```

:::

## Using JXA Scripts

Note that when using a compiled script, these can be be JavaScript for
Automation (JXA) scripts instead of AppleScripts. Everything works the same
except handlers correspond to top level JXA functions. JXA cannot be used in
plain text scripts.

An example of an extension using a JXA script is
[TaskPaper](https://github.com/pilotmoon/PopClip-Extensions/tree/master/source/TaskPaper.popclipext).
