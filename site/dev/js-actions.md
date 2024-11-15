---
outline: deep
titleTemplate: :title — PopClip Developer
---

# JavaScript actions

JavaScript actions run code in PopClip's own
[JavaScript environment](./js-environment), which gives them access to PopClip's
internal state and lets them interact with PopClip itself.

::: tip Module-based extensions

JavaScript actions provide a simplified way to run call in PopClip, for example
form a quick snippet. To access the full power of JavaScript, use a
[module-based extension](./js-modules).

:::

## Properties

A JavaScript action is defined by the presence of either a `javascript` or
`javascript file` field, as follows:

| Key               | Type   | Description                                                                       |
| ----------------- | ------ | --------------------------------------------------------------------------------- |
| `javascript`      | String | A JavaScript text string to load.                                                 |
| `javascript file` | String | Path to a JavaScript (`.js`) or TypeScript (`.ts`) file in the package directory. |

### Script format

The script's entry point is at the top level of the file. Internally, PopClip
loads the provided script and wraps it as a function. When the action is run,
PopClip calls the function.

::: details Function wrapper detail

As an example, imagine the following JavaScript is provided in the `javascript`
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

::: info About these examples

The examples are given as snippets using the
[inverted syntax](./snippets#inverted-syntax).

:::

Uppercase the text:

```javascript
// # popclip
// name: Uppercase
// icon: square filled AB
// after: paste-result
// language: javascript
return popclip.input.text.toUpperCase();
```
