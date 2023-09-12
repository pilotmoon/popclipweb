---
outline: deep
prev:
  text: JavaScript environment
  link: /dev/js-environment
titleTemplate: :title — PopClip Developer
---

# Module-based extensions

In contrast to [JavaScript actions](./js-actions) that define a single function,
module-based extensions let you define the extension itself using JavaScript,
programatically generating the extension's actions and options.

A module-based extension is defined by the presence of a `module` field in the
top level of the static config, as follows:

| Key      | Type   | Description                                                                             |
| -------- | ------ | --------------------------------------------------------------------------------------- |
| `module` | String | The path to a JavaScript (`.js`) or TypeScript (`.ts`) module to load from the package. |

The module is always loaded last, after the extension's static config. All
properties exported by the module will be merged into the extension's config.
The module is loaded by the same mechanism as `require()` — see
[module file format](./js-environment.md#supported-file-types).

::: info Modules as snippets

Modules can be specified as snippets using the
[inverted syntax](./snippets#inverted-syntax), by setting `module` to `true` in
the config header.

:::

### Example

The following snippet defines a complete module-based extension:

::: code-group

```javascript
// #popclip
// name: Module Demo
// after: show-result
// language: javascript
// module: true
module.exports = {
  icon: "square " + String(Math.floor(Math.random() * 100)),
  actions: [
    {
      title: "Action 1",
      code: (input) => {
        return "Hi from the action. Your text is: " + input.text;
      },
    },
  ],
};
```

```typescript
/// <reference path="/Applications/PopClip.app/Contents/Resources/popclip.d.ts" />
/* Note: The above line is optional. It will enable autocomplete
   and type-checking in code editors that support TypeScript.
   (Adjust to Setapp path if needed.) */
// #popclip
// name: Module Demo
// after: show-result
// language: typescript
// module: true
const extension: Extension = {
  icon: "square " + String(Math.floor(Math.random() * 100)),
  actions: [
    {
      title: "Action 1",
      code: (input) => {
        return "Hi from the action. Your text is: " + input.text;
      },
    },
  ],
};
export default extension;
```

:::

Observe a few things:

- The module has generated its own icon, by exporting an `icon` property. It
  uses a random number to generate a different icon each time the extension is
  loaded.
- The module defines its actions by exporting an `actions` array. See
  [Module actions](#module-actions).
- The extension's `name` and the action's `after` step, `show-result`, are
  specified in the static config (in this case, in the snippet header).

## Static properties

Certain properties of the extension can only be defined in the static config,
and cannot be overriden by the module. These are `popclipVersion`,
`macosVersion` and `entitlements`.

## Module actions

::: tip Detailed API reference

A more detailed definition of the action object, action function and population
function may be found in the
[JavaScript API Reference](https://pilotmoon.github.io/PopClip-Extensions/modules.html).

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
  code: (input, options, context) => {
    // ... do stuff ...
    doSomething();
    return someResult;
  }
}
```

```javascript [with async/await]
{
  code: async (input, options, context) => {
    // ... do stuff ...
    await doSomethingAsync();
    return someResult;
  }
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
