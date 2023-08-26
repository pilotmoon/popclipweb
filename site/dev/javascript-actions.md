# JavaScript actions

_Note: JavaScript extensions are brand new and it will take me some time to
document everything fully. The following gives the basics. Please bear with me!_

_**A note on "module-based" extensions:** There is a further kind of extension I
am calling a module-based extension. In a module-based extension, the extension
itself is defined by a JavaScript module. This allows greater flexibility and
customization of the extension, at the cost of being more complex to explain and
to use. This section describes how JavaScript fits in to the "classic" extension
structure, which is the easiest to explain and to use for simple tasks._

A JavaScript action is defined by the presence of either a `javascript file`
field or a `javascript` field, as follows:

| Key               | Type   | Description                                                                           |
| ----------------- | ------ | ------------------------------------------------------------------------------------- |
| `javascript file` | String | The name of the JavaScript file to run, for example `foo.js`.                         |
| `javascript`      | String | A text string to run as a JavaScript. For example: `popclip.showText('Hello world!')` |

PopClip loads the file (or the string) and evaluates it as if it were wrapped in
an async function call. Scripts can by return results by finishing with a return
statement. A quick example (Config.yaml):

```yaml
# popclip (this is exactly how the published Uppercase extension works)
name: Uppercase
icon: square filled AB
javascript: return popclip.input.text.toUpperCase()
after: paste-result
```

JS scripts have access to PopClip's state and can perform actions, via the
properties and methods of the `popclip` global object. There is draft
documentation here:
[PopClip Extensions JavaScript Reference](https://pilotmoon.github.io/PopClip-Extensions/).

Here is a quick reference for some commonly needed stuff:

- `popclip.input.text` - the full selected text
- `popclip.input.matchedText` - the part of the text matching the requirement or
  regex
- `popclip.input.html` - the html backing the selection (needs `captureHtml`
  field set)
- `popclip.input.markdown` - the markdownified html (needs `captureHtml` field
  set)
- `popclip.input.data.urls` - array of detected web URLs (similar to
  `POPCLIP_URLS` in shell scripts)
- `popclip.context.browserUrl` and `popclip.context.browserTitle` - hopefully
  self-explanatory
- `popclip.modifiers.command`, `popclip.modifiers.option`,
  `popclip.modifiers.shift`, `popclip.modifiers.control` - booleans for modifier
  keys pressed
- `popclip.pasteText('string')` - paste the string (similar to `paste-result`)
- `popclip.copyText('string')` - copy the string (similar to `copy-result`)
- `popclip.showText('string')` - show the string (similar to `show-result`)
- [`popclip.openUrl()`](https://pilotmoon.github.io/PopClip-Extensions/interfaces/PopClip.html#openUrl) -
  open a URL, similar to a URL extension
- [`popclip.pressKey()`](https://pilotmoon.github.io/PopClip-Extensions/interfaces/PopClip.html#pressKey) -
  presses a key combo, similar to a key press extension
- `print()` - global debug printing function

## The JavaScript Engine

PopClip's JavaScript engine is Apple's
[JavaScriptCore](https://developer.apple.com/documentation/javascriptcore),
which is part of macOS. The available language features and core libraries
depend on which version of macOS PopClip is running on. The minimum requirement
for PopClip is currently macOS 10.13.6, and scripts can assume it is safe to use
all features marked as "Safari 10.1" and below in MDN
([example](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function#browser_compatibility)),
which corresponds to ES2017 specification. Newer language features may be
available on higher versions of macOS.

## Error handling and debugging

In general you don't need to worry too much about catching and handling errors.
If the script throws an error, PopClip simply shows the shaking-'X'. Debug
output can be viewed in the console as described in
[Debug Output](#debug-output).

## Asynchronous operations and async/await

Usually, the JavaScript code will be run synchronously (i.e., as a single code
block that PopClip waits to finish). However PopClip provides implementations of
`XMLHttpRequest` and `setTimeout`, which are asynchronous. If a script uses
these, PopClip will show its spinner and wait until the last asynchronous
operation has finished. During asynchronous operations, clicking PopClip's
spinner will cancel all current operations.

The returned value from the script (if any) is the return value of the last
function to complete. For example:

```yaml
# popclip setTimeout example
name: setTimeout Test
javascript: | 
  setTimeout(() => { 
    return 'bar'
  }, 1000) // 1 second delay
  return 'foo'
after: show-result # result shown will be 'bar', not 'foo'
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

```shell-script
/Application/PopClip.app/Contents/MacOS/PopClip runjs test.js
```

Some notes:

- When running in the test harness, the `popclip` global is not available.
- Scripts can output strings with the global `print()` function (not
  `console.log()`).
- Scripts running in the test harness always have the network access
  entitlement.

## JavaScript language reference

There are loads of JavaScript language references out there, but the one I use
and recommend is
[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference).
