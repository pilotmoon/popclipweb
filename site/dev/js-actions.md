---
outline: deep
titleTemplate: PopClip Developer
---

# JavaScript actions

JavaScript actions run JavaScript code. JavaScript actions are run in PopClip's
own [JavaScript environment](./js-environment), which gives them access to
PopClip's internal state and lets them interact with PopClip itself.

::: tip Module-based extensions

For more complex functionality, JavaScript [module-based extensions](./js-modules) are
a flexible and powerful alternative to JavaScript actions.

:::

## Properties

A JavaScript action is defined by the presence of either a `javascript file` or
`javascript` field, as follows:

| Key               | Type   | Description                            |
| ----------------- | ------ | -------------------------------------- |
| `javascript`      | String | A JavaScript text string to load.      |
| `javascript file` | String | The name of a JavaScript file to load. |

When you specify `javascript` or `javascript file`, PopClip loads the provided
script and wraps it as a function. When the action is run, PopClip calls the
function.

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

## Input and output

Scripts take their input from the
[global `popclip` object](./js-environment.md#global-popclip-object).

If the function exits by returning a string, it will be passed to the `after`
step.

## Indicating errors

Scripts should indicate success by exiting normally, and should indicate failure
by throwing an error. PopClip will catch any erros thrown by the script and
display the shaking-'X'.

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
