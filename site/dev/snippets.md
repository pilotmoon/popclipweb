# Snippets

A snippet is the simplest kind of PopClip extension, because it is just plain text. PopClip can load a snippet directly from a text selection, without the need for separate files or folders.

## Example

It is easiest to start with an example:

```yaml
#popclip extension to search Emojipedia
name: Emojipedia
icon: search filled E
url: https://emojipedia.org/search/?q=***
```

When you select the above text, PopClip will detect the snippet and offer an "Install Extension" action. Clicking this will install the extension, like magic!

## Format

A snippet always begins with `#popclip` (or `# popclip`) and can be up to 5000 characters long. It is parsed as YAML.

::: tip Commments in snippets

Note that `#` begins a YAML comment. Thus, the entire snippet including the `#popclip` line parses as valid YAML.

:::

The body of the snippet defines the extension [config](./config.md).

If the extension is of type Shortcut, Service, URL, Key Combo or JavaScript (without network entitlement), the extension snippet will install without the usual "unsigned extension" prompt. Shell Script snippets, AppleScript snippets and JavaScript snippets with the network entitlement will still give the unsigned warning.

In snippets, `name` is a required field. Installing another extension with the same name will overwrite an existing one with the same name, but you can avoid this by specifying a unique `identifier` field.

## More examples

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

## Inverted syntax

When making a snippet that contains a script, you an use an alternative, "inside-out" format. Add the YAML config as the header to any source code, and PopClip will see the whole file as a snippet.

When using this format you must specify either the `interpreter` (for a shell script) or `language` (for JavaScript or AppleScript). The whole text will then become the `shell script file`, `javascript file` or `applescript file` for the extension, as appropriate.

As an example, consider this regular YAML snippet for a JavaScript extension:

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

## `.popcliptxt` files

You can save a snippet to a plain text file with a `.popcliptxt` extension. When you double-click such a file in Finder, PopClip will load the snippet from the file and install it. The 5000 character limit does not apply to files.
