---
outline: deep
prev:
  text: JavaScript environment
  link: /dev/js-environment
---

# Module-based extensions

In contrast to [JavaScript actions](./js-actions) that define a single function,
module-based extensions let you define the extension itself using JavaScript,
programatically generating the extension's actions and options.

A module-based extension is defined by the presence of a `module` field in the
top level of the static config, as follows:

| Key      | Type   | Description                                                                                                |
| -------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| `module` | String | The name of a JavaScript file to load from the package. The file must export a CommonJS JavaScript module. |

The module is always loaded last, after the extension's static config. All
properties exported by the module will be merged into the extension's config.

::: info Modules as snippets

Modules can be specified as snippets using the
[inverted syntax](./snippets#inverted-syntax), by setting `module` to `true` in
the config header.

:::

### Example

The following snippet defines a complete JavaScript module extension:

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

Observe a few things:

- The module has generated its own icon, by exporting an `icon` property. It
  uses a random number to generate a different icon each time the extension is
  loaded.
- The module defines its actions by exporting an `actions` array. See
  [Module actions](#module-actions).
- The extension's `name` and the action's `after` step, `show-result`, is
  specified in the static config (in this case, in the snippet header).

## Module format

PopClip expects the module to export a JavaScript object using
[CommonJS](https://en.wikipedia.org/wiki/CommonJS) module format. ES modules are
not supported.

<!-- PopClip expects the module to export a JavaScript object using either
[CommonJS](https://en.wikipedia.org/wiki/CommonJS) or
[AMD](https://requirejs.org/docs/whyamd.html) module format.

::: info CommonJS vs AMD

CommonJS is the module format originally used by Node.js, characterized by its
use of `module.exports = ...` and so on. AMD is a different module format used
by some JavaScript libraries. If you're not sure which to use, CommonJS is
probably the right choice. All the examples in this documentation use CommonJS.

PopClip does not support ES modules (ESM) at this time.

::: -->

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
dynamically generates the actions every time text is selected. The population
function is called with the same arguments as the action function. It should
return an array of action objects.

```javascript
// #popclip
// { name: Dynamic Demo, entitlements: [dynamic], lang: js, module: true }
exports.actions = (input, options, context) => {
  let myActions = [];
  for (let i = 1; i <= 5; i += 1) {
    myActions.push({
      title: String(i),
      code: (input, options, context) => {
        popclip.showText("Hi from Action " + i);
      },
    });
  }
  return myActions;
};
```

The population function has the following limitations:

- Cannot access the network. (`XMLHttpRequest` is unavailable.)
- Cannot call methods on the `popclip` global object.
- Cannot access `popclip.context.browserUrl` or `popclip.context.browserTitle`.

<!-- ## Further Example

TODO. -->
