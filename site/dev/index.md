---
outline: deep
prev: false
---
<script setup lang="ts">
import EditionSwitcher from "../src/EditionSwitcher.vue";
import Ed from "../src/Ed.vue";
</script>

# Developer Reference

This section of the documentation provides a detailed specification for
developing PopClip extensions.

<!--
If you are not a programmer, you may find it easier to use the
[PopClip Extension Creator](https://pilotmoon.com/popclip/extensions/create/). -->

## Extensions Overview

### Types of actions

An extension defines one or more actions. Each action can be one of seven types:

| Action Type                               | Description                                                  |
| ----------------------------------------- | ------------------------------------------------------------ |
| [Shortcut](./shortcut-actions)            | Send the selected text to a macOS Shortcut.                  |
| [Service](./service-actions)              | Send the selected text to a macOS Service.                   |
| [URL](./url-actions.md)                   | Open a URL, with the selected text URL-encoded and inserted. |
| [Key Press](./keypress-actions.md)        | Press a key combination.                                     |
| [AppleScript](./applescript-actions.md)   | Run an AppleScript script.                                   |
| [Shell Script](./shell-script-actions.md) | Run a shell script.                                          |
| [JavaScript](./javascript-actions.md)     | Run a JavaScript script.                                     |

### Snippets and Packages

A PopClip extension can be either a [snippet](./snippets.md) or a
[package](./packages.md).

|                 | Snippet                                                   | Package                                                                                            |
| --------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| What is it?     | Plain text in YAML format.                                | A folder containing a config file plus other files such as icons, source files, and a readme file. |
| Install method  | PopClip can load it directly from a text selection.       | Double-clicking it will open it in PopClip.                                                        |
| Distribution    | Can be shared as text, e.g. on forums, pastebins, etc.    | Can be downloaded as a file.                                                                       |
| File extensions | None (direct selection)<br> `.popcliptxt` (text file)     | `.popclipext` (folder)<br> `.popclipextz` (zipped folder)                                          |
| Signing         | Not signed.                                               | Can be signed.                                                                                     |
| Advantages      | Easy to create and share. No need for separate files.     | Easy for end user to install. Allows modular source code with complex functionality.               |
| Disadvantages   | Limited to what can be done with a single text file.      | More complex to create. Steeper learning curve.                                                    |
| Philosophy      | "Empowered user" mentality. Visibility promotes learning. | "Developer" mentality. Opaque format keeps everything hidden from end user.                        |

### Icons

An important aspect of an extension is its icon. There are several ways to
specify an icon, as described in [Icons](./icons.md) section.

<!-- ### Filter rules

Extensions have access to the following filtering mechanisms, to help prevent
actions appearing when they are not useful:

- Filter by application (either include or exclude).
- Filter by matching a regular expression.
- Filter by whether cut, paste or formatting is available.
- Filter by whether the text contains a URL, email address or file path.
- Filter by the current values of the extensions's options.
- Custom filtering via a JavaScript function (dynamic JavaScript extensions
  only). -->

## Extension Signing

Please be aware that PopClip extensions can contain arbitrary executable code.
Be careful about the extensions you create, and be wary about loading extensions
you get from someone else.

PopClip extensions published in the [directory](/extensions/) are digitally
signed. PopClip will install them directly without showing any warning to the
user. If you create your own extension, it will not be signed. PopClip will
display a warning dialog when you try to install it:

![Example unsigned warning.](../guide/media/shot-unsigned-warning.png#h400)

::: tip Snippets

Snippets cannot be signed, but only snippets containing Shell Script actions,
AppleScript actions or JavaScript actions with the network entitlement will
trigger the unsigned warning.

:::

## Development environment

<EditionSwitcher />

### Turn off unsigned warning

If you find the unsigned extension warning gets annoying while you are testing your work, you can turn ot off. Run the following command at the Terminal, then Quit and restart
PopClip:

<Ed code base="defaults write com.pilotmoon.popclip LoadUnsignedExtensions -bool YES" setapp="defaults write com.pilotmoon.popclip-setapp LoadUnsignedExtensions -bool YES"/> 

### Debug Output

To help you when creating extensions, PopClip can be configured to write script
output and debug info to be viewed with the Console app. To enable it, run this
command in Terminal, then Quit and restart PopClip:

<Ed code base="defaults write com.pilotmoon.popclip EnableExtensionDebug -bool YES" setapp="defaults write com.pilotmoon.popclip-setapp EnableExtensionDebug -bool YES"/> 
