---
outline: deep
titleTemplate: :title — PopClip Developer
---

# Calling external scripts

JavaScript code in PopClip can call out to shell scripts and AppleScript.
This is often the easiest way to use a command-line tool or automate another
app from within a [JavaScript action](./js-actions) or
[module extension](./js-modules), without needing a whole
[Shell Script](./shell-script-actions) or
[AppleScript](./applescript-actions) action.

All the facilities on this page require the
`script` [entitlement](./top-level-properties) in the extension's config, and may only
be used during the action phase — that is, from an action's code, not at load
or population time. There is no timeout: a run ends when the script exits, or
when the user cancels the action by clicking the spinner, which kills the
script.

## The `$` shell tag

The global [`$`](/dev/api/interfaces/ShellTag.html) is the convenient way to
run a shell command. Write the command as a
[template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals),
and await the result:

```javascript
// #popclip
// name: What Day
// entitlements: [script]
const result = await $`date +%A`;
popclip.showText(`Today is ${result}`);
```

The command runs with `/bin/zsh` in strict mode (`set -euo pipefail`). The
result converts to a string as the command's output with trailing newlines
stripped — the same rule as shell command substitution.

The tag's key property is that **interpolated values are shell-escaped**:
each `${...}` value arrives in the command as a literal word, so selected
text, file paths — anything — can never become shell syntax. Don't put your
own quotes around an interpolation; it arrives already quoted.

```javascript
// #popclip
// name: Speak Definition
// icon: symbol:character.book.closed
// entitlements: [script]
const word = popclip.input.text.trim();
const definition = util.getDictionaryDefinition(word) ?? "no definition";
await $`say ${definition}`;
```

The template text itself is used **raw** — everything between the backticks
goes to the shell exactly as written, so backslashes survive and JavaScript
escape sequences are not interpreted. Write shell variables as `$VAR` rather
than `${VAR}` (which JavaScript would claim).

A result can be interpolated into a later command, splicing in as its output
text — so one command's output feeds the next. Arrays splice in as separate
words.

Calling `$` with an options object returns a configured tag, which can be
kept and reused — even for other interpreters:

```javascript
// #popclip
// name: Python Upper
// entitlements: [script]
const py = $({ interpreter: "python3", quote: JSON.stringify, prefix: null });
const result = await py`print(${popclip.input.text}.upper())`;
popclip.showText(`${result}`);
```

See [ShellTag](/dev/api/interfaces/ShellTag.html) for the full options.

## Shell script functions

For more control than the `$` tag — or to run a script file shipped in the
extension package — use
[`popclip.runShellScript()`](/dev/api/interfaces/PopClip.html#runshellscript)
and
[`popclip.runShellScriptFile()`](/dev/api/interfaces/PopClip.html#runshellscriptfile).

`runShellScript()` takes the script as source text, and any `interpreter` —
not just shells:

```javascript
const { stdout } = await popclip.runShellScript("print(2 ** 100)", {
  interpreter: "python3",
});
```

`runShellScriptFile()` takes the package-relative path of a script file, and
also accepts `stdin` and positional `arguments`:

```javascript
const { stdout } = await popclip.runShellScriptFile("scripts/convert.sh", {
  arguments: [popclip.input.text],
  stdin: popclip.input.html,
});
```

Points to note:

- By default the interpreter is executed directly, with no shell involved and
  a minimal, deterministic environment; the `shellMode` option can route the
  run through the user's shell instead (as a login or non-login shell), the
  same as the classic Shell Script action's
  [`shellMode`](./shell-script-actions#shell-mode) key.
- To pass data into the script, use the `env`, `stdin` or `arguments` options
  — they need no escaping. Avoid composing data into the script source
  itself; that is the `$` tag's job, since it escapes its interpolations.
  (For building command strings by hand, there is also
  [`util.shellEscape()`](/dev/api/interfaces/Util.html#shellescape).)
- A successful run resolves with `{ stdout, stderr, status }`. A script that
  exits nonzero (or is killed by a signal) rejects the promise, with the same
  fields carried on the error.

See [ShellScriptOptions](/dev/api/interfaces/ShellScriptOptions.html) for the
full options.

## AppleScript functions

To run AppleScript, use
[`popclip.runAppleScript()`](/dev/api/interfaces/PopClip.html#runapplescript)
(source text) and
[`popclip.runAppleScriptFile()`](/dev/api/interfaces/PopClip.html#runapplescriptfile)
(a package-relative `.applescript` or `.scpt` file).

Rather than composing values into the script source, name a `handler`
(subroutine) in the script and pass values as `parameters` — no escaping
worries:

```javascript
// #popclip
// name: Add Reminder
// icon: symbol:list.bullet.clipboard
// entitlements: [script]
const script = `
on addReminder(theName)
  tell application id "com.apple.reminders"
    make new reminder with properties {name:theName}
  end tell
end addReminder`;
await popclip.runAppleScript(script, {
  handler: "addReminder",
  parameters: [popclip.input.text],
  permissions: ["reminders"],
});
```

The `permissions` option names system permissions the script needs, so
PopClip can show the consent prompt and, if access is denied, direct the user
to the right System Settings pane.

The promise resolves with the script's return value. A script that errors
rejects the promise with an error carrying the AppleScript error number as
its `errorNumber` property.

See [AppleScriptOptions](/dev/api/interfaces/AppleScriptOptions.html) for the
full options.

## Related functions

Two neighboring functions need no `script` entitlement:

- [`popclip.runShortcut()`](/dev/api/interfaces/PopClip.html#runshortcut)
  runs a macOS Shortcut by name.
- [`popclip.performService()`](/dev/api/interfaces/PopClip.html#performservice)
  performs a macOS Service by name.
