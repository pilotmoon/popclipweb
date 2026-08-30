---
titleTemplate: :title — PopClip Developer
---

# Shortcut actions

In a Shortcut action, PopClip will invoke a macOS [Shortcut](https://support.apple.com/en-gb/guide/shortcuts-mac/apdf22b0444c/mac) by name.
An extension can only invoke shortcuts the user has built or installed themselves.

::: tip Running a shortcut from JavaScript

You can also use
[`popclip.runShortcut()`](/dev/api/interfaces/PopClip.html#runshortcut)
within a [JavaScript action](./js-actions).

```javascript
// #popclip shortcut js example
// name: Summarize
// language: javascript
const summary = await popclip.runShortcut("Summarize Text", {
  input: popclip.input.text,
});
popclip.pasteText(`Summary:\n${summary}\n\nFull text:\n${popclip.input.text}`);
```

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
