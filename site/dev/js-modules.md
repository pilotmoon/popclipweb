---
outline: deep
prev:
  text: JavaScript environment
  link: /dev/js-environment
titleTemplate: :title — PopClip Developer
---

# Module-based extensions

Module-based extensions let you use the full power of JavaScript or TypeScript
to define your PopClip extension. This allows you use code to construct
properties like `options` at load time, and to define `actions` dynamically, for example to
generate titles or icons in response to the input text.

When you provide a config file called `Config.js` ot `Config.ts`, PopClip treats
this as a JavaScript or TypeScript module and looks for the extension's
properties in the exported object, after first loading static properties from
YAML in a comment header.

All properties exported by the module will be merged into the extension's
config, overriding any static properties with the same name (except for the
[static-only properties](#static-only-properties) which cannot be overriden).

The module can also define a population function to dynamically populate the
actions.

::: info Snippets as modules

You can also define a module in a snippet by setting `module: true`.

:::

## Example

The following JavaScript snippet defines a complete module-based extension:

```javascript
// #popclip
// name: Module Demo
// after: show-result
// language: javascript
// module: true

// this is only run once, at load time
const theNumber = String(Math.floor(Math.random() * 100));

module.exports = {
  icon: `square ${theNumber}`,
  actions: [
    {
      title: "The Title",
      code: (input) => {
        return `The number is ${theNumber}. Your text is: ${input.text}`;
      },
    },
  ],
};
```

Observe a few things:

- The extension's `name` and the action's `after` step, `show-result`, are
  specified in the static config in the header.
- At load time, the module generates a random number and saves it in a variable.
- The module exports an `icon` property, displaying the random number in a
  square.
- The module defines its actions by exporting an `actions` array. See
  [Module actions](#module-actions).

### More examples

See the following examples from the PopClip Extensions Directory:

- _Alternating Case_,
  [Config.js](https://github.com/pilotmoon/PopClip-Extensions/blob/master/source/AlternatingCase.popclipext/Config.js)
- _Copy as Markdown_,
  [Config.js](https://github.com/pilotmoon/PopClip-Extensions/blob/master/source/CopyAsMarkdown.popclipext/Config.js),
- _OpenAI Chat_ (TypeScript example),
  [Config.ts](https://github.com/pilotmoon/PopClip-Extensions/blob/master/source/OpenAIChat.popclipext/Config.ts),

## File format

### Comment header

In `Config.js` and `Config.ts` a YAML comment header must be provided defining
`name` as the bare minumum. The header is in the same format as for a snippet.
See [Snippets - Inverted syntax](./snippets#inverted-syntax).

### Module format

The module file may be written in JavaScript (`.js`) or TypeScript (`.ts`).

The module format is
[CommonJS](https://www.typescriptlang.org/docs/handbook/2/modules.html#commonjs-syntax).
You can either export a single object with `module.exports = ...` or export
individual properties like `exports.foo = ...`.

TypeScript files can use
[ES Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html#es-module-syntax)
syntax, which will be transpiled to CommonJS under the hood. JavaScript files
may not use ES Modules syntax.

The exported property names and types are the same as defined in
[Config](./config), with the execption of `actions` which has special handling -
see [Module actions](#module-actions).

## Specifying the module file

The module does not have to be loaded from `Config.js`/`Config.ts`.
Alternatively, you can provide static config in another format (e.g.
`Config.json`) and specify a module file name as follows:

| Key      | Type   | Description                                                          |
| -------- | ------ | -------------------------------------------------------------------- |
| `module` | String | The path to a JavaScript (`.js`) or TypeScript (`.ts`) file to load. |

## Static-only properties

Certain properties of the extension can only be defined in the static config,
and cannot be overriden by the module. These are `identifier`, `popclipVersion`,
`macosVersion` and `entitlements`.

## Module actions

::: tip Detailed API reference

A more detailed definition of the action object, action function and population
function may be found in the
[JavaScript API Reference](https://pilotmoon.github.io/popclip-types/modules.html).

:::

A module defines its actions by exporting an `actions` property, which can be
either:

- an array of [action objects](#action-object), or
- a [population function](#population-function) returning an array of action
  objects.

Note that a module always provides _all_ the actions for the extension. You
cannot mix regular actions and module actions in the same extension.

### Action object

Each action object has the same [properties](./actions) as a regular action,
with the addition of the following:

| Key     | Type          | Description                                                                                                                                                                         |
| ------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `code`  | Function      | A function to run when the action is invoked. See: [Action function](#action-function).                                                                                             |
| `regex` | RegExp Object | You may export a JavaScript [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp), and PopClip will use this instead of a string regex. |

### Action function

The action function is called with the following arguments:

- `input`: same object as `popclip.input`
- `options`: same object as `popclip.options`
- `context`: same object as `popclip.context`

::: code-group

```javascript [synchronous]
{
  code: ((input, options, context) => {
    // ... do stuff ...
    doSomething();
    return someResult;
  });
}
```

```javascript [with async/await]
{
  code: (async (input, options, context) => {
    // ... do stuff ...
    await doSomethingAsync();
    return someResult;
  });
}
```

:::

The function may return a string, which will be passed to the `after` step.
Otherwise it should return `undefined` or `null`.

The function may optionally be `async`, and use `await`.

The function may indicate an error by throwing an exception, as per
[JavaScript actions](./js-actions.md#indicating-errors).

### Population function

::: warning Entitlement needed

To use a population function, the `dynamic` entitlement must be present in the
`entitlements` array in the static config. This cannot be set if the `network`
entitlement is also being used.

:::

The population function is set as the `actions` property of the module. It
dynamically supplies actions every time the PopClip bar appears. The population
function is called with the same arguments as the action function, and it
returns an array of action objects.

::: code-group

```javascript
// #popclip dynamic example
// { name: Dynamic Title, entitlements: [dynamic], lang: js, module: true }
exports.actions = (input, options, context) => {
  return [{
    title: `<${input.text.slice(0, 10)}>`,
    code: (input, options, context) => {
      popclip.showText("Hi from Action");
    },
  }];
};
```

```typescript
// #popclip dynamic example
// { name: Dynamic Title, entitlements: [dynamic], lang: ts, module: true }
export const actions: Action[] = (input, options, context) => {
  return [{
    title: `<${input.text.slice(0, 10)}>`,
    code: (input, options, context) => {
      popclip.showText("Hi from Action");
    },
  }];
};
```

:::

The population function has the following limitations:

- Cannot access the network (`XMLHttpRequest` is unavailable).
- Cannot call methods on the `popclip` global object.
- Cannot access `popclip.context.browserUrl` or `popclip.context.browserTitle`.

## Abbreviated forms

### The `action` property

If the module defines only a single action, it may be exported as the `action`
property instead of in an `actions` array. For example:

::: code-group

```javascript
// #popclip
// { name: Single Action, lang: js, module: true}
exports.action = {
  code: () => {
    popclip.showText("hi mom!");
  },
};
```

```typescript
// #popclip
// { name: Single Action, lang: ts, module: true}
export const action: Action = {
  code: () => {
    popclip.showText("hi mom!");
  },
};
```

:::

### Action function shorthand

If the action object has only a `code` property, it may be exported as a
function instead of an object. For example:

::: code-group

```javascript
// #popclip
// { name: Action Function, lang: js, module: true}
exports.action = () => {
  popclip.showText("hi mom!");
};
```

```typescript
// #popclip
// { name: Action Function, lang: ts, module: true}
export const action: ActionFunction = () => {
  popclip.showText("hi mom!");
};
```
