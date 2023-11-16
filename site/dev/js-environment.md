---
outline: deep
next:
  text: Module-based extensions
  link: /dev/js-modules
titleTemplate: :title — PopClip Developer
---

# JavaScript environment

This page describes PopClip's JavaScript environment, in which
[JavaScript actions](./js-actions) and [module-based extensions](./js-modules)
run.

## Overview

PopClip's JavaScript engine is Apple's
[JavaScriptCore](https://developer.apple.com/documentation/javascriptcore),
which is part of macOS.

JavaScriptCore's language and standard library support varies depending on macOS
version. However, PopClip uses [core-js](https://github.com/zloirock/core-js) to
provide polyfills for the JavaScript standard library up to ES2023. You can also
assume availability of language features up to ES2017 on all macOS versions that
PopClip supports.

PopClip also has built-in support for TypeScript. See
[TypeScript support](#typescript-support).

::: tip Language reference

The JavaScript language reference I use and recommend is
[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference).

:::

## PopClip globals

PopClip provides a global object, `popclip`, and other globals, which are
documented in detail in the
[JavaScript API Reference](https://pilotmoon.github.io/PopClip-Extensions/modules.html).
The following is a summary of the commonly needed parts.

### Global `popclip` object

Scripts can access the selected text and other input via the following readonly
properties of the `popclip` global:

- `popclip.input.text`: the full plain text selection
- `popclip.input.matchedText`: the part of the text matching the requirement or
  regex
- `popclip.input.regexResult`: if regex was specified, this is an array
  containing the full result of the match, including any capture groups
- `popclip.input.html`: the html backing the selection (if `capture html` is
  set)
- `popclip.input.markdown`: the markdownified html (if `capture html` is set)
- `popclip.input.data.urls`: array of detected web URLs
- `popclip.context.browserUrl`, `popclip.context.browserTitle`: browser page URL
  and title, if available.
- `popclip.modifiers.command`, `popclip.modifiers.option`,
  `popclip.modifiers.shift`, `popclip.modifiers.control`: booleans for modifier
  keys pressed
- `popclip.options`: an object with properties for each option, where the
  property name is the option's identifier. Option values can be either strings
  or booleans

Scripts can perform actions via calling methods on the `popclip` global:

- [`popclip.pasteText()`](https://pilotmoon.github.io/PopClip-Extensions/interfaces/PopClip.html#pasteText):
  paste a given string (similar to `paste-result`)
- [`popclip.copyText()`](https://pilotmoon.github.io/PopClip-Extensions/interfaces/PopClip.html#copyText):
  copy a string to the clipboard (similar to `copy-result`)
- [`popclip.showText()`](https://pilotmoon.github.io/PopClip-Extensions/interfaces/PopClip.html#showText):
  show a string in the PopClip bar (similar to `show-result`)
- [`popclip.openUrl()`](https://pilotmoon.github.io/PopClip-Extensions/interfaces/PopClip.html#openUrl):
  open a URL (similar to a URL action)
- [`popclip.pressKey()`](https://pilotmoon.github.io/PopClip-Extensions/interfaces/PopClip.html#pressKey):
  presses a key combo (similar to a key press extension)
- [`popclip.performCommand()`](https://pilotmoon.github.io/PopClip-Extensions/interfaces/PopClip.html#performCommand):
  perform a cut, copy or paste command in the foreground app (simlar to the
  `before` and `after` steps)
- [`popclip.showSuccess()`](https://pilotmoon.github.io/PopClip-Extensions/interfaces/PopClip.html#showSuccess),
  [`popclip.showFailure()`](https://pilotmoon.github.io/PopClip-Extensions/interfaces/PopClip.html#showFailure),
  [`popclip.showSettings()`](https://pilotmoon.github.io/PopClip-Extensions/interfaces/PopClip.html#showSettings):
  show a check mark, shaking-X, or Pop up the extension's settings.

### Global `pasteboard` object

Scripts can also access the macOS clipboard directly, via the `pasteboard`
global:

- `pasteboard.text` - the current plain text content of the clipboard, a
  read/write property.

### Other globals

There is also a global function `print()` for debug output, and a global
[`require()`](#using-require) function.

## Using `require()`

PopClip has a `require()` function for loading modules and JSON data from other
files. It takes a single string argument, interpreted as follows:

- If the string starts with `./` or `../`, it is interpreted as a path to a file
  in the package directory, relative the current file.
- Otherwise, the string is interpreted as a path relative to the root of the
  package directory.
- If no file is found in the package directory, the string is then checked
  against the names of the [bundled libraries](#bundled-libraries). If found,
  the library module is loaded and returned.

Results are cached, and subsequent calls to `require()` with the same argument
will return the same object instance that was returned the first time.

File paths beginning with `/` or using `..` to go up a directory level outside
the package directory are not valid.

### Supported file types

The `require()` function can load the following file types:

| File extension | Description                                                                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.js`          | A JavaScript module in [CommonJS](https://www.typescriptlang.org/docs/handbook/2/modules.html#commonjs-syntax) format.                             |
| `.ts`          | A TypeScript module. TypeScript modules may use [ES Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html#es-module-syntax) syntax. |
| `.json`        | A JSON file parsed into a JavaScript object.                                                                                                       |

If no file name extension is specified, PopClip will try `.js`, `.ts`, `.json`
in order.

### Return value

The return value of `require()` is the exported value of the module, or the
parsed JSON object. If the specified file or library module is not found, or an
invalid path is supplied, `undefined` is returned.

## Bundled libraries

Some libraries from [NPM](https://www.npmjs.org/) are bundled within the PopClip
app itself, and are available to load by scripts. These are:

| Library        | Version | Description                    |
| -------------- | ------- | ------------------------------ |
| axios          | 1.5.0   | HTTP client                    |
| case-anything  | 2.1.13  | Case conversion library        |
| content-type   | 1.0.5   | Parse HTTP Content-Type header |
| dom-serializer | 2.0.0   | HTML serializer                |
| entities       | 4.5.0   | HTML entity encoder/decoder    |
| htmlparser2    | 8.0.2   | HTML parser                    |
| js-yaml        | 4.1.0   | YAML parser                    |
| linkedom       | 0.15.0  | DOM implementation             |
| linkifyjs      | 4.1.1   | Detect web links in text       |
| rot13-cipher   | 1.0.0   | ROT13 cipher                   |
| sanitize-html  | 2.11.0  | HTML sanitizer                 |
| turndown       | 7.1.2   | HTML to Markdown converter     |
| typescript     | 5.2.2   | TypeScript transpiler & tools  |
| zod            | 3.22.2  | Object schema validator        |

Library modules may be loaded by name, for example:

::: code-group

```javascript
const axios = require("axios");
```

```typescript
import axios from "axios";
```

:::

## Asynchronous operations and async/await

PopClip provides implementations of `XMLHttpRequest` and `setTimeout`, which are
asynchronous. If a script uses these, PopClip will show its spinner and wait
until the last asynchronous operation has finished. During asynchronous
operations, clicking PopClip's spinner will cancel all current operations.

The returned value from the script (if any) is the return value of the last
function to complete. For example:

```javascript
// # popclip setTimeout example
// name: setTimeout Test
// after: show-result
// language: javascript
setTimeout(() => {
  return "bar";
}, 1000); // 1 second delay
return "foo";
// result shown will be 'bar', not 'foo'
```

Your functions can be `async`, and you can use the `await` keyword when calling
any function that returns a Promise. PopClip handles the details of resolving
promises internally.

As a convenience, PopClip supplies a global function `sleep()` as a
promise-based wrapper around `setTimeout()`:

```javascript
// # popclip await example
// name: Await Test
// language: js
await sleep(5000); // 5 second delay
popclip.showText("Boo!");
```

## Network access from JavaScript

::: warning Entitlement needed

To use XHR, the `network` entitlement must be present in the `entitlements`
array in the extension's config.

:::

PopClip provides its own implementation of
[`XMLHttpRequest`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
(XHR). This is the only way for JavaScript code to access the network.

PopClip is also bundled with the HTTP library
[axios](https://axios-http.com/docs/intro), which is an easier to use wrapper
around XHR.

Due to macOS's App Transport Security, PopClip can only access `https:` URLs.
Attempts to access `http:` URLs will throw a network error.

Here's an example extension snippet that downloads a selected URL's contents,
and copies it to the clipboard:

::: code-group

```javascript
// # popclip JS network example
// name: Download Text
// icon: symbol:square.and.arrow.down.fill
// requirements: [url]
// entitlements: [network]
// after: copy-result
// language: javascript
const axios = require("axios");
const response = await axios.get(popclip.input.data.urls[0]);
/* note: there is no particular need to check the return status here.
   axios calls will throw an error if the HTTP status is not 200/2xx. */
return response.data;
```

```typescript
// # popclip TS network example
// name: Download Text
// icon: symbol:square.and.arrow.down.fill
// requirements: [url]
// entitlements: [network]
// after: copy-result
// language: typescript
import axios from "axios";
const response = await axios.get(popclip.input.data.urls[0]);
/* note: there is no particular need to check the return status here.
   axios calls will throw an error if the HTTP status is not 200/2xx. */
return response.data;
```

:::

For a more substantial axios example, see for example
[Instant Translate](https://github.com/pilotmoon/PopClip-Extensions/tree/master/source/InstantTranslate.popclipext).

## TypeScript support

PopClip has built-in support for [TypeScript](https://www.typescriptlang.org/).
You can supply TypeScript source in any place where a JavaScript file can be
specified. PopClip loads files with a `.js` extension as raw JavaScript, and
loads files with a `.ts` extension as TypeScript.

At load time, PopClip transpiles TypeScript files into JavaScript source.
PopClip does not do any type validation on the TypeScript source.

PopClip ships with a TypeScript type definitions file, `popclip.d.ts`, to assist
in developing extensions. This will enable autocomplete and type-checking in
TypeScript-aware editors such as VS Code. So that your editor can find the type
definitions, you can reference the definitions file in your TypeScript code
using a
[triple-slash directive](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html)
at the top of the file, like this:

::: code-group

```typescript [Standalone and Mac App Store editions]
/// <reference path="/Applications/PopClip.app/Contents/Resources/popclip.d.ts" />
```

```typescript [Setapp edition]
/// <reference path="/Applications/Setapp/PopClip.app/Contents/Resources/popclip.d.ts" />
```

:::

## JavaScript testing

PopClip has a 'test harness' mode, which runs JavaScript files in the PopClip
environment from the command line. It is useful for running unit tests of your
code in PopClip's environment, with the same libraries, globals etc. It is
activated by calling PopClip's executable (inside the PopClip.app package) with
the parameter `runjs` followed by the file name to run.

```bash
/Applications/PopClip.app/Contents/MacOS/PopClip runjs test.js
```

Some notes:

- When running in the test harness, the `popclip` global is not available.
- Scripts can output strings with the global `print()` function (not
  `console.log()`).
- Scripts running in the test harness always have the network access
  entitlement.
- The test harness is a somewhat experimental feature at present. Please reach
  out to me if something does not seem to work as expected.
