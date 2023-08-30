# JavaScript environment

This page describes PopClip's JavaScript environment, in which
[JavaScript actions](./js-actions) and [JavaScript modules](./js-modules) run.

## Overview

PopClip's JavaScript engine is Apple's
[JavaScriptCore](https://developer.apple.com/documentation/javascriptcore),
which is part of macOS.

The version of JavaScriptCore used by PopClip depends on the macOS version, but
to avoid issues with older versions of JavaScriptCore, PopClip pre-loads the
[core-js](https://github.com/zloirock/core-js) library, which provides a
polyfill for most modern JavaScript features on older macOS versions.

::: tip JavaScript language reference

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
`require()` function for loading other package files or libraries.

## Bundled libraries

Some libraries from NPM are available to load by scripts. These are:

| Library        | Version | Description                    |
| -------------- | ------- | ------------------------------ |
| axios          | 0.26.1  | HTTP client                    |
| buffer         | 6.0.3   | Node Buffer implementation     |
| case-anything  | 2.1.10  | Case conversion library        |
| content-type   | 1.0.4   | Parse HTTP Content-Type header |
| dom-serializer | 1.4.1   | HTML serializer                |
| entities       | 2.2.0   | HTML entity encoder/decoder    |
| htmlparser2    | 6.1.0   | HTML parser                    |
| js-yaml        | 4.1.0   | YAML parser                    |
| linkedom       | 0.12.1  | DOM implementation             |
| node-blob      | 0.0.2   | Node Blob implementation       |
| rot13-cipher   | 1.0.0   | ROT13 cipher                   |
| sanitize-html  | 2.7.3   | HTML sanitizer                 |
| turndown       | 7.1.1   | HTML to Markdown converter     |

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
// after: show-result # result shown will be 'bar', not 'foo'
// lang: javascript
setTimeout(() => {
  return "bar";
}, 1000); // 1 second delay
return "foo";
```

You can also use the `await` keyword when calling any function that returns a
Promise. Internally, PopClip runs all the code you supply wrapped in an `async`
function call, and resolves any returned promises itself.

As a convenience, PopClip also supplies a global function
`sleep(delayInMilliseconds)` as a promise-based wrapper around `setTimeout`:

```yaml
# popclip await example
name: Await Test
javascript: | 
  await sleep(5000) // 5 second delay
  popclip.showText('Boo!')
```

## Network access from JavaScript

PopClip provides its own implementation of XMLHttpRequest (XHR). To use it, you
need to include the `network` entitlement in the `entitlements` field of the
config file.

PopClip is also bundled with the HTTP library
[axios](https://axios-http.com/docs/intro) version 0.26.1, which you can load
using `const axios = require('axios')`. This is a lot easier to use than XHR.

Some limitations to be aware of:

- Due to macOS's App Transport Security, PopClip can only access https URLs.
  Attempting to access http URLs results in a network error from XHR.
- PopClip's implementation of XHR currently can only download text MIME types.
  Binary data will fail.

Here's an example extension snippet that downloads a selected URL's contents,
and copies it to the clipboard:

```yaml
# popclip JS network example
name: Download Text
icon: symbol:square.and.arrow.down.fill
requirements: [url]
entitlements: [network]
javascript: |
  const axios = require('axios')
  const response = await axios.get(popclip.input.data.urls[0]) // throws for non-2xx status
  return response.data
after: copy-result
```

For a more substantial axios example, see for example
[Instant Translate](https://github.com/pilotmoon/PopClip-Extensions/tree/master/source/InstantTranslate).

## About TypeScript and .ts files

When looking at the extensions in this repo I have made, you will see `.ts`
files. These are [TypeScript](https://www.typescriptlang.org/) source code,
which compiles down to JavaScript. I prefer to use TS than raw JS as it helps me
to write correct code, aided by the TypeScript definitions file
[popclip.d.ts](/popclip.d.ts). The TypeScript configuration I use is in
[tsconfig.json](/tsconfig.json).

## JavaScript testing

PopClip has a 'test harness' mode, which runs JavaScript files in the PopClip
environment from the command line. It is useful for running unit tests of your
code in PopClip's environment, with the same libraries, globals etc. It is
activated by calling PopClip's executable (inside the PopCLip.app package) with
the parameter `runjs` followed by the file name to run.

```bash
/Application/PopClip.app/Contents/MacOS/PopClip runjs test.js
```

Some notes:

- When running in the test harness, the `popclip` global is not available.
- Scripts can output strings with the global `print()` function (not
  `console.log()`).
- Scripts running in the test harness always have the network access
  entitlement.
