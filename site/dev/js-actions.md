---
outline: deep
---

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

A JavaScript action is defined by the presence of either a `javascript file`,
`javascript` or `module` field, as follows:

| Key               | Type   | Description                                                            |
| ----------------- | ------ | ---------------------------------------------------------------------- |
| `javascript`      | String | A JavaScript text string to load as a [function](#function-mode).      |
| `javascript file` | String | The name of a JavaScript file to load as a [function](#function-mode). |
| `module`          | String | The name of a JavaScript file to load as a [module](#module-mode).     |

### Function mode

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

### Module mode

For more complex functionality, a module is a more flexible and powerful way to
structure your code. When you specify `module`, PopClip loads the provided
script as a CommonJS module.

Properties exported by the module will be merged into the extension's config.
With this method, you can use JavaScript to define the extension itself,
programatically generate the extension's options and actions, even its own icon
and name.

For more information, see TODO.

<!-- [JavaScript modules](./js-modules). -->

::: info Modules as snippets

Modules can be specified as snippets using the
[inverted syntax](./snippets#inverted-syntax), by setting `module` to `true` in
the config header.

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
