# JavaScript actions

JavaScript actions run JavaScript code. JavaScript actions are run in PopClip's
own [JavaScript environment](./js-environment), which gives them access to
PopClip's internal state and lets them interact with PopClip itself.

<!-- **A note on "module-based" extensions:** There is a further kind of extension I
am calling a module-based extension. In a module-based extension, the extension
itself is defined by a JavaScript module. This allows greater flexibility and
customization of the extension, at the cost of being more complex to explain and
to use. This section describes how JavaScript fits in to the "classic" extension
structure, which is the easiest to explain and to use for simple tasks._ -->

## Properties

A JavaScript action is defined by the presence of either a `javascript file`
field or a `javascript` field, as follows:

| Key               | Type   | Description                                             |
| ----------------- | ------ | ------------------------------------------------------- |
| `javascript file` | String | The name of a JavaScript file to load from the package. |
| `javascript`      | String | A text string to run as JavaScript.                     |

PopClip loads the provided script, wraps it in an async function call, and then
calls the function.

::: details Function wrapper detail

As an example, take the following JavaScript provided in the `javascript` field:

```javascript
return "foo";
```

Internally, this will be wrapped as follows:

```javascript
(async function () { // [!code focus:2]
  use strict;
  return "foo";
})(); // [!code focus:1]
```

:::

## Input and output

Scripts take their input from the [global `popclip` object](./js-environment.md#global-popclip-object).

If the script exits by returning a string, it will be passed to the `after`
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
