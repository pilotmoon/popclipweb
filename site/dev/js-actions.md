---
outline: deep
titleTemplate: :title — PopClip Developer
---

# JavaScript actions

A JavaScript action runs code in PopClip's own
[JavaScript environment](./js-environment), with access to the selected text
and to PopClip itself through the global `popclip` object. It is the simplest
way to run code in PopClip. In a
[code snippet](./snippets#inverted-syntax), everything after the header is
the action's code, run when the action is clicked:

```javascript
// #popclip
// name: Uppercase
// icon: square filled AB
// after: paste-result
return popclip.input.text.toUpperCase();
```

## Properties

A JavaScript action is defined by the presence of either a `javaScript` or
`javaScriptFile` field, as follows:

| Key               | Type   | Description                                                                       |
| ----------------- | ------ | --------------------------------------------------------------------------------- |
| `javaScript`      | String | A JavaScript text string to load.                                                 |
| `javaScriptFile` | String | Path to a JavaScript (`.js`) or TypeScript (`.ts`) file in the package directory. |

### Script format

The script's entry point is at the top level of the file. Internally, PopClip
loads the provided script and wraps it as a function. When the action is run,
PopClip calls the function.

::: details Function wrapper detail

As an example, imagine the following JavaScript is provided in the `javaScript`
field:

```javascript
return "foo";
```

Internally, this will be wrapped in an async arrow function definition like
this:

```javascript
const main = async () => { // [!code focus:1]
  return "foo";
}; // [!code focus:1]
```

When the action is run, PopClip calls this internal `main` function with no
arguments.

:::

In addition to pure JavaScript, PopClip can load TypeScript from files named
with a a `.ts` extension. See
[TypeScript support](./js-environment.md#typescript-support).

## Input and output

Scripts take their input from the
[global `popclip` object](./js-environment.md#global-popclip-object).

If the script exits by returning a string, it will be passed to the `after`
step.

::: info Return type

To return a value to the `after` step, it must be of type `string`. If the
script returns a value of any other type, such as `number` or `object`, PopClip
will ignore it.

:::

## Indicating errors

Scripts should indicate success by completing normally (either by explicitly
returning a value, or implicitly returning `undefined`) and should indicate
failure by throwing an error. PopClip will catch any erros thrown by the script
and display the shaking-'X'.

To indicate an error with the user's settings, and pop up the extension's
settings UI, throw an error message starting with the specific words
`settings error` or `not signed in` (not case sensitive). For example:

```javascript
throw new Error("Settings error: missing API key");
```

## Examples

These examples are all complete [code snippets](./snippets#inverted-syntax) —
select the whole block to install one.

Paste the selected text, then press Return — two PopClip primitives chained
with `await`:

```javascript
// #popclip
// name: Paste & Enter
// icon: symbol:return
// requirements: [paste]
await popclip.pasteText(popclip.input.text);
await popclip.pressKey("return");
```

Look up the selected word in the macOS dictionary, then speak the definition
aloud through the `say` command:

```javascript
// #popclip
// name: Speak Definition
// icon: symbol:character.book.closed
// entitlements: [script]
const word = popclip.input.text.trim();
const definition = util.getDictionaryDefinition(word) ?? "no definition found";
await popclip.runShellScript("say $definition", {
  interpreter: "zsh",
  env: { definition },
});
```

Fetch the page at the selected URL and show its title — network access, a
bundled module, and the `after` step working together:

```javascript
// #popclip
// name: Page Title
// icon: symbol:globe
// requirements: [url]
// entitlements: [network]
// after: show-result
const axios = require("axios");
const response = await axios.get(popclip.input.data.urls[0]);
return String(response.data).match(/<title[^>]*>([^<]*)</i)?.[1] ?? "No title found";
```

## Growing into a module

A JavaScript action is one script with static config around it. When you want
code to define more of the extension — several actions, options, titles or
icons computed at load time — export an extension object with
`defineExtension({...})` instead. The file is then loaded as a
[module extension](./js-modules): its top level runs once at load time to
define the extension, and each action's `code` function runs at click time.
