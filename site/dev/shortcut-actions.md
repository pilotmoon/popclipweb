---
titleTemplate: :title — PopClip Developer
---

# Shortcut actions

In a Shortcut action, PopClip will invoke a macOS [Shortcut](https://support.apple.com/en-gb/guide/shortcuts-mac/apdf22b0444c/mac) by name.

::: info Availability
Shortcuts are only available on macOS 12.0 and above. On earlier versions of macOS, any shortcut actions defined in an extension will not appear in the PopClip bar.
:::

## Properties

A shortcut action is defined by the presence of a `shortcut name` field, as follows:

| Key             | Type   | Description                                                                                    |
| --------------- | ------ | ---------------------------------------------------------------------------------------------- |
| `shortcut name` | String | The name of the macOS Shortcut to call. This must exactly match its name in the Shortcuts app. |

## Input and output

The selected plain text will be sent as input to the shortcut. Any plain text returned by the shortcut will be available to the `after` step.

## Example

The following example snippet defines an extension with a single shortcut action that calls a shortcut called `My Shortcut Name`:

```yaml
#popclip shortcut example
name: Run My Shortcut
shortcut name: My Shortcut Name
```

## Running a shortcut from JavaScript

For anything beyond "send the selection, paste what comes back" — choosing the
shortcut based on the text, passing something other than the selection, or doing
more with the result — use
[`popclip.runShortcut()`](/dev/api/interfaces/PopClip.html#runshortcut)
from a [JavaScript action](./js-actions) instead. It takes the same shortcut
name and resolves with the shortcut's output.

```javascript
// #popclip shortcut js example
// name: Summarize
// language: javascript
// after: show-result
const summary = await popclip.runShortcut("Summarize Text", {
  input: popclip.input.text,
});
return summary;
```

An extension can only invoke shortcuts the user has
built and installed themselves. A name that is not in the user's library rejects
with an error.
