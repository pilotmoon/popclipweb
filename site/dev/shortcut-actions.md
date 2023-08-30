---
titleTemplate: PopClip Developer
---
# Shortcut actions

In a Shortcut action, PopClip will invoke a macOS [Shortcut](https://support.apple.com/en-gb/guide/shortcuts-mac/apdf22b0444c/mac) by name.

::: info Availability
Shortcuts are only available on macOS 12.0 and above. On earlier versions of macOS, any shortcut actions defined in an extension will not appear in the PopClip bar.
:::

## Properties

A shortcut action is defined by the presence of a `shortcut name` field, as follows:

|Key|Type|Description|
|---|----|-----------|
|`shortcut name`|String|The name of the macOS Shortcut to call. This must exactly match its name in the Shortcuts app.|

## Input and output

The selected plain text will be sent as input to the shortcut. Any plain text returned by the shortcut will be available to the `after` step.

## Example

The following example snippet defines an extension with a single shortcut action that calls a shortcut called `My Shortcut Name`:

```yaml
#popclip shortcut example
name: Run My Shortcut
shortcut name: My Shortcut Name
```