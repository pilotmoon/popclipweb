---
outline: deep
prev: false
---

# PopClip Extensions Developer Reference

This section of the documentation provides a detailed specificarion of the
format and capabilities of PopClip Extensions, so that you to create your own.
Whilst developing complex extensions demands some programming expertise, you can
craft simple extensions with just a few lines of text.

<!--
If you are not a programmer, you may find it easier to use the
[PopClip Extension Creator](https://pilotmoon.com/popclip/extensions/create/). -->

## Overview

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

### Filtering

Extensions have access to the following filtering mechanisms, to help prevent
actions appearing when they are not useful:

- Filter by matching a regular expression.
- Filter by application (either include or exclude).
- Filter by whether cut, copy or paste is available.
- Filter by whether the text contains a URL, email address or file path.
- Filter by the current values of the extensions's options.

---

### Extension Signing

By default, PopClip will display a warning dialog when you try to install your
own extension, because it is not digitally signed.

![Example unsigned warning.](../guide/media/shot-unsigned-warning.png#h400)

If you find this gets annoying while you are testing your work, you can turn off
the warning. Run the following command at the Terminal, then Quit and restart
PopClip:

```zsh
defaults write com.pilotmoon.popclip LoadUnsignedExtensions -bool YES
```

Please be aware that PopClip extensions can contain arbitrary executable code.
Be careful about the extensions you create, and be wary about loading extensions
you get from someone else.

(PopClip will never load unsigned extensions whose identifier has a
`com.pilotmoon.` prefix, which is reserved for 'official' extensions. When
basing your own extension off such an extension, you will need to change the
identifier.)

### Debug Output

To help you when creating extensions, PopClip can be configured to write script
output and debug info to be viewed with the Console app. To enable it, run this
command in Terminal, then Quit and restart PopClip:

```zsh
defaults write com.pilotmoon.popclip EnableExtensionDebug -bool YES
```

## Key name mapping

Some field names were different in older versions of PopClip. Others have
alternative allowable forms to avoid confusion when expressed camel case, e.g.
`appleScriptFile` is mapped to `applescriptFile`.

PopClip applies the following mapping to field names loaded from the config
file:

| Old/Alternative name      | Canonical name   |
| ------------------------- | ---------------- |
| image file                | icon             |
| required software version | popclip version  |
| pop clip version          | popclip version  |
| required os version       | macos version    |
| mac os version            | macos version    |
| pass html                 | capture html     |
| blocked apps              | excluded apps    |
| regular expression        | regex            |
| apple script              | applescript      |
| apple script file         | applescript file |
| apple script call         | applescript call |
| java script               | javascript       |
| java script file          | javascript file  |

Also, if the field name has the prefix `extension` or `option`, it is removed.
