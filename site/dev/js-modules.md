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
properties like `options` at load time, and to define `actions` dynamically, for
example to generate titles or icons in response to the input text.

When you provide a config file called `Config.js` or `Config.ts`, PopClip treats
this as a JavaScript or TypeScript module and looks for the extension's
properties in the exported object, after first loading static properties from
YAML in a comment header. The recommended way to define the exported object is
to call [`defineExtension()`](#module-format) with it.

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

defineExtension({
  actions: [
    {
      title: "The Title",
      icon: `square ${theNumber}`,
      code: (input) => {
        return `The number is ${theNumber}. Your text is: ${input.text}`;
      },
    },
  ],
});
```

Observe a few things:

- The extension's `name` and the action's `after` step, `show-result`, are
  specified in the static config in the header.
- At load time, the module generates a random number and saves it in a variable.
- The action has an `icon` property, displaying the random number in a
  square.
- The module defines the extension by passing an object with an `actions`
  array to `defineExtension()`. See [Module actions](#module-actions).

### More examples

See the following examples from the PopClip Extensions Directory:

- _Paste and Match Style_,
  [Config.ts](https://github.com/pilotmoon/PopClip-Extensions/blob/master/source/PasteAndMatch.popclipext/Config.ts)
- _Shuffle_,
  [Config.ts](https://github.com/pilotmoon/PopClip-Extensions/blob/master/source/Shuffle.popclipext/Config.ts)
- _Brackets_,
  [Config.ts](https://github.com/pilotmoon/PopClip-Extensions/blob/master/source/Brackets.popclipext/Config.ts)

## File format

### Comment header

In `Config.js` and `Config.ts` a YAML comment header must be provided defining
the extension's `name` and any other
[static-only properties](#static-only-properties). The header is in the same
format as for a snippet (see
[Snippets - Inverted syntax](./snippets#inverted-syntax)) except that you do not
specify `language` or `module` in the header. The file is automatically loaded
as a module.

### Module format

The module file may be written in JavaScript (`.js`) or TypeScript (`.ts`).

The recommended way to define the extension is to call `defineExtension()`,
passing the extension object. At runtime this is simply
`module.exports = extension` — the difference is entirely one of types.
Because the parameter is typed, every property of the object written inside
the call is checked and autocompleted in your editor, with no type
annotations needed anywhere. This is the form we use for our own extensions.

The exported property names and types are the same as defined in
[Config](./config), with the exception of `actions` which has special handling —
see [Module actions](#module-actions).

#### Other export styles

Exporting the properties directly is also fully supported. The module format
is
[CommonJS](https://www.typescriptlang.org/docs/handbook/2/modules.html#commonjs-syntax):
you can export a single object with `module.exports = ...` or export
individual properties like `exports.foo = ...`. TypeScript files can
additionally use
[ES Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html#es-module-syntax)
syntax such as `export const action = ...`, which is transpiled to CommonJS
under the hood. (JavaScript files may not use ES Modules syntax.)

#### Typed options

In TypeScript, specifying `defineExtension()`'s generic type parameter
extends type checking to the `options` parameter of action functions and the
population function. `InferOptions` derives that type from the options array
itself, so nothing is restated:

```typescript
// #popclip
// { name: Prefixer, lang: ts, module: true }

// the options array is declared first so its type can be inferred
const options = [
  { identifier: "prefix", type: "string", defaultValue: ">" },
] as const;

defineExtension<InferOptions<typeof options>>({
  options,
  action: (input, options) => {
    // options.prefix is known to exist, and to be a string
    popclip.pasteText(options.prefix + input.text);
  },
});
```

## Specifying the module file

The module does not have to be loaded from `Config.js`/`Config.ts`.
Alternatively, you can provide static config in another format (e.g.
`Config.json`) and specify a module file name as follows:

| Key      | Type   | Description                                                          |
| -------- | ------ | -------------------------------------------------------------------- |
| `module` | String | The path to a JavaScript (`.js`) or TypeScript (`.ts`) file to load. |

## Static-only properties

Certain properties of the extension can only be defined in the static config,
and cannot be overriden by the module. These are `name`, `icon`, `identifier`,
`popclipVersion`, `macosVersion`, `entitlements`, `module`, `showAs`,
`authServiceLabel` and `offersMultipleInstances`.

## Module actions

::: tip Detailed API reference

A more detailed definition of the action object, action function and population
function may be found in the
[JavaScript API Reference](/dev/api/),
or in [**popclip.d.ts**](/dev/popclip.d.ts), which is the same API as a single
TypeScript definitions file.

:::

A module defines its actions with the `actions` property of the extension
object, which can be either:

- an array of [action objects](#action-object), or
- a [population function](#population-function) returning an array of action
  objects.

Note that a module always provides _all_ the actions for the extension. You
cannot mix regular actions and module actions in the same extension.

### Action object

Each action object takes the same [properties](./actions) as a regular
action, with one caveat and the additions below. The caveat: the action
flags — `title`, `icon`, `requirements`, `regex`, `before`, `after` and so
on — work as they do in static config, but the action-type properties such
as `url`, `keyCombo` and `shellScript` are static config only and are
ignored in module actions. A module action's behavior comes from its `code`
function.

| Key       | Type              | Description                                                                                                                                                                         |
| --------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `code`    | Function          | A function to run when the action is invoked. See: [Action function](#action-function).                                                                                             |
| `regex`   | RegExp Object     | You may export a JavaScript [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp), and PopClip will use this instead of a string regex. |
| `submenu` | Array or Function | An array of action objects to show in a submenu of this action, or a function generating them dynamically. See [Submenu functions](#submenu-functions).                             |

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
  };
}
```

```javascript [with async/await]
{
  code: async (input, options, context) => {
    // ... do stuff ...
    await doSomethingAsync();
    return someResult;
  };
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
or `script` entitlement is also being used.

:::

The population function is set as the `actions` property of the extension
object. It dynamically supplies actions every time the PopClip bar appears.
The population function is called with the same arguments as the action
function, and it returns an array of action objects.

```javascript
// #popclip dynamic example
// { name: Dynamic Title, entitlements: [dynamic], lang: js, module: true }
defineExtension({
  actions: (input, options, context) => {
    return [
      {
        title: `<${input.text.slice(0, 10)}>`,
        code: (input, options, context) => {
          popclip.showText("Hi from Action");
        },
      },
    ];
  },
});
```

The same code works unchanged in TypeScript (`lang: ts`), where
`defineExtension()` type-checks the population function and the actions it
returns.

### Restrictions during population

The population function has the following limitations:

- Cannot access the network — `XMLHttpRequest` is unavailable.
- Cannot call _functions_ on the `popclip` global object.
- Cannot call `sleep()`, `setTimeout()` or `setInterval()`.
- Cannot access `secret` options in `popclip.options`.

_Properties_ on the `popclip` global (`popclip.input`, `popclip.context`, `popclip.options` and `popclip.modifiers`)
_may_ be read during population — with the exception of `secret` options.

Functions on the [`util`](./js-environment#global-util-object) global
may be called freely during population.

### Submenu functions

An action object may define a `submenu` property, giving the action a submenu
of child actions — see [Submenus](./actions#submenus). The value may be a
static array of action objects, or a function.

If a function is supplied, it is called at the moment the submenu opens, to
generate the submenu's actions dynamically. It has the same signature and
limitations as a [population function](#population-function), and likewise
requires the `dynamic` entitlement.

```typescript
// #popclip submenu function example
// { name: Sub Demo, icon: circle filled 3, entitlements: [dynamic], lang: ts, module: true }
defineExtension({
  actions: [
    {
      title: "Word Menu",
      // called when the submenu opens: one child action per word, capped at 3
      submenu: (input) => {
        return input.text
          .split(/\s+/)
          .slice(0, 3)
          .map((word) => ({
            title: word,
            code: () => popclip.showText(`You chose: ${word}`),
          }));
      },
    },
  ],
});
```

## Abbreviated forms

### The `action` property

If the extension defines only a single action, it may be given as the
`action` property instead of in an `actions` array. For example:

```javascript
// #popclip
// { name: Single Action, lang: js, module: true}
defineExtension({
  action: {
    code: () => {
      popclip.showText("hi mom!");
    },
  },
});
```

### Action function shorthand

If the action object has only a `code` property, it may be given as a
function instead of an object. For example:

```javascript
// #popclip
// { name: Action Function, lang: js, module: true}
defineExtension({
  action: () => {
    popclip.showText("hi mom!");
  },
});
```
