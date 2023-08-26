# Snippet format

A snippet is the simplest PopClip extension format, because it is just plain text. PopClip can load a snippet directly from a text selection, without the need for a separate file or folder.

## About Snippets

The simplest way to create and share extensions is by writing a "snippet". You can do this anywhere you like, in any place you can type text.

Here is an example snippet:

```yaml
#popclip extension to search Emojipedia
name: Emojipedia
icon: search filled E
url: https://emojipedia.org/search/?q=***
```

When you select the above text, PopClip will offer an "Install Extension" action. Clicking it will install the above extension directly, without any need for config files or a .popclipext folder.

The format of a snippet is a simply a regular PopClip extension config in [YAML](https://quickref.me/yaml) format, marked with `#popclip` (or `# popclip`) at the start. (Note that `#` denotes a YAML comment. The entire selection including the `#popclip` line must parse as valid YAML.)

All features of regular extensions can be used, with the limitation that additional files (such as icon files or scripts) cannot be included. Extension snippets can be a maximum of 5000 characters.

If the extension is of type Shortcut, Service, URL, Key Combo or JavaScript (without network entitlement), the extension snippet will install without the usual "unsigned extension" prompt. Shell Script snippets, AppleScript snippets and JavaScript snippets with the network entitlement will still give the unsigned warning.

In snippets, `name` is a required field. Installing another extension with the same name will overwrite an existing one with the same name, but you can avoid this by specifying a unique `identifier` field.

## Snippets Examples

A Shortcuts example:

```yaml
# popclip shortcuts example
name: Run My Shortcut
icon: symbol:moon.stars # Apple SF Symbols
macos version: '12.0' # shortcuts only work on Monterey and above!
shortcut name: My Shortcut Name
```

A Key Press example:

```yaml
#popclip
name: Key Press Example
key combo: command option J
```

A Service example -- this time using flow-style YAML markup with braces.

```yaml
#popclip
{ name: Make Sticky, service name: Make Sticky }
```

An shell script example (new in PopClip 2022.12):

```yaml
#popclip shellscript example  
name: Say
shell script: say -v Daniel $POPCLIP_TEXT
interpreter: zsh
```

A JavaScript example, including multiple actions:

```yaml
#popclip js + multi action example
name: Markdown Formatting
requirements: [text, paste]
actions:
- title: Markdown Bold # note: actions have a `title`, not a `name`
  icon: circle filled B
  javascript: popclip.pasteText('**' + popclip.input.text + '**')
- title: Markdown Italic
  icon: circle filled I
  javascript: popclip.pasteText('*' + popclip.input.text + '*')  
```

A more complex Key Combo example with a raw key code and using some more fields:

```yaml
# popclip extension snippet - more complex example
name: Paste and Enter
icon: square monospaced ↵
requirements: [paste]
before: paste
key combo: 0x24
```

## Inverted Snippets

When making a snippet that contains a script, you an use an alternative, "inside-out" format. Add the YAML as the header to any source code, and PopClip will see the whole file as a snippet.

When using a snippet in a header you must specify either the `interpreter` (for a shell script) or `language` (for JavaScript or AppleScript). The whole text will then become the `shell script file`, `javascript file` or `applescript file` for the extension, as appropriate.

As an example, consider this "classic" snippet for a JavaScript extension:

```yaml
#popclip - classic YAML snippet
name: Hello JS
icon: Hi!
javascript: |
  const greeting = 'Hello ' + popclip.input.text
  popclip.showText(greeting)
```

Using the inverted syntax, You can write the same thing like this:

```javascript
// #popclip - source code with snippet header
// name: Hello JS
// icon: Hi!
// language: javascript
const greeting = 'Hello ' + popclip.input.text
popclip.showText(greeting)
```

The snippet header should be added using the comment style of the source language, using the same comment prefix on every line. (That is, whatever characters precede `#popclip`, must also precede the other lines.)

Here is Python example, this time with a compact single line snippet, using braces (YAML flow-style):

```python
# #popclip
# { name: Hello Python, icon: hi, after: show-result, interpreter: python3 }
import os
print('Hello, ' + os.environ['POPCLIP_TEXT'] + '!', end='')
```

An alternative way to specify a shell script is to put a shebang (`#!`) line at the top, in which case, the `interpreter` field is not needed:

```python
#!/usr/bin/env python3
# #popclip
# { name: Hello Python 2, icon: hi, after: show-result }
import os
print('Hello again, ' + os.environ['POPCLIP_TEXT'] + '!', end='')
```

An AppleScript example:

```applescript
-- # PopClip LaunchBar example
-- { name: LaunchBar, icon: LB, language: applescript }
tell application "LaunchBar"
  set selection to "{popclip text}"
end tell
```