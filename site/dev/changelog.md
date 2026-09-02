---
aside: false
titleTemplate: :title — PopClip Developer
next: false
---

<!-- markdownlint-configure-file
{
  "no-duplicate-header": false
}
-->

# Developer Changelog

Detailed notes on changes to PopClip's extensions programming interface will be
kept in this file.

<div class="info custom-block" style="padding-top: 8px">

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

</div>

## Beta / Unreleased

### Added

- Snippets: the `language` key is now optional. A code body under a `//` comment header is treated as TypeScript by default:

  ```js
  // #popclip
  // name: Minimal JS/TS Snippet
  popclip.showText("hi friends!");
  ```

  Likewise, code with a `--` comment header is AppleScript by default. For real files (`.js`/`.ts` files in packages or opened as snippets) the suffix still determines the language.

- Snippets: `module: true` is no longer required. PopClip now
  [detects](/dev/js-modules#module-detection) that the code is a module
  if it uses `export` syntax, a `defineExtension()`
  call, or a reference to `module` or `exports`. A complete module snippet is
  now just:

  ```js
  // #popclip
  // name: Minimal Module Snippet
  defineExtension({ action: () => popclip.showText("hi friends!") });
  ```

- JavaScript: new
  [popclip.runShellScript()](/dev/api/interfaces/PopClip.html#runshellscript)
  and
  [popclip.runShellScriptFile()](/dev/api/interfaces/PopClip.html#runshellscriptfile)
  methods, for running a script with the `script` entitlement.
  Set the interpreter, environment variables, a prefix line, stdin and positional arguments.
  ```js
  const { stdout } = await popclip.runShellScript("print(2 ** 100)", {
    interpreter: "python3",
  });
  ```
- JavaScript: a new global template function `$` — the
  [shell tag](/dev/api/interfaces/ShellTag.html), a convenience shorthand for running shell commands from
  JavaScript. It runs the template text with `/bin/zsh` in strict mode (`set -euo pipefail`), and
  interpolated values are shell-escaped.

  ```js
  // #popclip speak definition example
  // name: Speak Definition
  // entitlements: [script]
  const word = popclip.input.text.trim();
  const definition = util.getDictionaryDefinition(word) ?? "no definition";
  await $`say ${definition}`;
  ```

- When running shell scripts, a new
  [`shell mode`](/dev/shell-script-actions#shell-mode)/`shellMode` setting controls how the
  script run is executed: `login` (via the user's shell as a
  login shell), `nonlogin`, or `none` (no shell at all — direct execution).
  For legacy compatibility, classic Shell Script actions default to `login`, but the new JavaScript methods default to `none`.
- JavaScript: new
  [popclip.performService()](/dev/api/interfaces/PopClip.html#performservice)
  method performs a macOS Service by name, with string or content-dictionary
  input.
- JavaScript: new
  [util.hash()](/dev/api/interfaces/Util.html#hash)
  method computes a plain message digest. It is the counterpart to
  [util.hmac()](/dev/api/interfaces/Util.html#hmac) and supports the same
  algorithms — `sha1`, `md5`, `sha256`, `sha384`, `sha512` and `sha224` —
  taking a `Uint8Array` and returning a `Uint8Array`.
  ```js
  const digest = util.hash(Buffer.from(popclip.input.text), "sha256");
  const hex = Buffer.from(digest).toString("hex");
  ```
- JavaScript:
  [util.base64Encode()](/dev/api/interfaces/Util.html#base64encode)
  now accepts a `Uint8Array` as well as a string, so the output of
  `util.hash()` or `util.hmac()` can be encoded directly. A string is encoded
  as before, so existing calls are unaffected.
- JavaScript:
  [util.base64Decode()](/dev/api/interfaces/Util.html#base64decode)
  can now return the decoded bytes as a `Uint8Array` rather than as a string,
  for data that is not text.
  ```js
  const bytes = util.base64Decode(encoded, { bytes: true });
  ```
- JavaScript: [Buffer](/dev/api/classes/Buffer.html) now supports the
  `"base64url"` encoding, both as a global and via `require("buffer")`. It
  uses the standard URL-safe alphabet (`+/` → `-_`) and no padding when
  encoding, and is interchangeable with `"base64"` when decoding.
  ```js
  Buffer.from("hello?~").toString("base64url"); // aGVsbG8_fg
  ```
- New `migrate from` key for `string` and `multiple` options: names a removed
  option whose stored value carries over to this one if its
  value is a non-empty string. Useful with `allow other` where a multiple
  option with separate free text override was used by a previous extension version.

### Changed

- Installing an unsigned extension whose config declares the
  `script` entitlement now shows the install confirmation.
- A module that mixes a default export with named exports is now a load
  error. Previously, the named exports were silently ignored.

### Fixed

- JavaScript: [util.hmac()](/dev/api/interfaces/Util.html#hmac) read from the
  start of the backing buffer when passed a `Uint8Array` view with a non-zero
  offset, such as one made with `subarray()`, producing the wrong result.

## Version 2026.8 (6159)

### Added

- Files with `.js`, `.ts`, and `.yaml` extensions can now be opened
  directly as extension [snippets](snippets), the same as `.popcliptxt` files.
  PopClip appears in the Open With menu for them, without becoming their default
  application. You can also drag the files onto the PopClip menu bar icon.
- New `script` entitlement, required to use the new AppleScript-running JavaScript methods
  below. Like `network`, it cannot be combined with `dynamic`.
- JavaScript: new
  [popclip.runAppleScript()](/dev/api/interfaces/PopClip.html#runapplescript)
  and
  [popclip.runAppleScriptFile()](/dev/api/interfaces/PopClip.html#runapplescriptfile)
  methods run an AppleScript.
  ```js
  const result = await popclip.runAppleScript(
    'on greet(a)\nreturn "hello " & a\nend greet',
    { handler: "greet", parameters: [popclip.input.text] },
  );
  ```
- JavaScript: new
  [popclip.runShortcut()](/dev/api/interfaces/PopClip.html#runshortcut)
  method runs a macOS Shortcut by name.
  ```js
  const summary = await popclip.runShortcut("Summarize Text", {
    input: popclip.input.text,
  });
  ```
- JavaScript: new
  [popclip.revealFile()](/dev/api/interfaces/PopClip.html#revealfile)
  method shows a file or folder in the Finder. Takes an absolute path — the kind
  found in `popclip.input.data.paths` — with a leading `~` expanded.
  ```js
  popclip.revealFile(popclip.input.data.paths[0]);
  popclip.revealFile("~/Downloads");
  ```
- JavaScript: new dictionary functions on the `util` global:
  [util.hasDictionaryDefinition()](/dev/api/interfaces/Util.html#hasdictionarydefinition)
  and
  [util.getDictionaryDefinition()](/dev/api/interfaces/Util.html#getdictionarydefinition),
  looking words up in the same dictionaries as the macOS Dictionary app.
- JavaScript: new spelling functions on the `util` global:
  [util.checkSpelling()](/dev/api/interfaces/Util.html#checkspelling),
  [util.getSpellingGuesses()](/dev/api/interfaces/Util.html#getspellingguesses),
  [util.getSpellingLanguages()](/dev/api/interfaces/Util.html#getspellinglanguages)
  and
  [util.getPreferredSpellingLanguages()](/dev/api/interfaces/Util.html#getpreferredspellinglanguages),
  via the system spell checker.
  ```js
  const guesses = util.getSpellingGuesses(popclip.input.text, {
    language: "en",
    limit: 5,
  });
  ```
- Key Press actions: new `key combo target` property, choosing where PopClip
  posts the key events: to the session event tap (`session`, the default, and
  what PopClip has always done), to the process of the application the action is
  acting on (`app`), or to the HID event tap (`hid`). See [Key Press actions](key-press-actions#target).
- JavaScript:
  [popclip.pressKey()](/dev/api/interfaces/PopClip.html#presskey)
  takes an options object as its third argument, with the same `target` choice:
  `popclip.pressKey('command b', 0, { target: 'app' })`.
- JavaScript: `popclip.pressKey()` now returns a promise that resolves once the
  press has been made. Await it when a later step depends on the press having
  completed.
- JavaScript: new
  [popclip.pressKeys()](/dev/api/interfaces/PopClip.html#presskeys)
  method presses a sequence of key combos, with optional waits, as one unit:
  `await popclip.pressKeys(['command space', 'wait 100', 'command v'], { target: 'session' })`. Entries
  take the same forms as `key combos` config entries; the same `target` option
  as `pressKey` applies to the whole sequence.
- New [action properties](actions#common-properties):
  - `wants primary display`: the action asks to be the one centred above the pointer when the popup appears.
  - `wants initial display`: for an action with a submenu, the submenu asks to be already open
    when the popup appears.
- New `shell script rationale` config field: a brief explanation of why an
  extension needs a Shell Script action instead of JavaScript. Ignored by the
  app; the [Extensions Directory](/extensions/submit#shell-script-policy) requires it
  for submissions with a Shell Script action.

### Changed

- JavaScript: `popclip.pasteText()`, `popclip.pasteContent()`,
  `popclip.copyText()`, `popclip.copyContent()`, `popclip.performCommand()` and
  `popclip.share()` now return promises. Previously documented as returning
  nothing, so this is purely additive — existing calls are unaffected. Await one
  when a later step depends on it having finished:
  ```js
  await popclip.performCommand("copy");
  ```
- Documentation: removed the documented claim that population functions may not
  read `popclip.context.browserUrl` and `popclip.context.browserTitle`, which was incorrect.
- Documentation: added the previously undocumented `keywords` config field to
  the top level properties table. It supplies
  extra search words for the extension's directory listing.

## PopClip 2026.7 (5992)

### Added

- Actions can now have submenus, using the new `submenu` property. A submenu is
  defined by an array of child actions, or (in JavaScript extensions) a
  population function that generates the actions dynamically when the submenu
  opens. The function form requires the `dynamic` entitlement. See [Submenus](actions#submenus) and [Submenu functions](js-modules#submenu-functions).
- New top-level config properties:
  - `show as`: set the action's default presentation to `icon` or `text`.
  - `auth service label`: a label identifying the service to be signed in to, shown in
    the action's settings UI.
  - `offers multiple instances`: controls whether the user can duplicate the action
    to create multiple instances.
- New keys for option dictionaries:
  - `multiline`: for `string` options, show a multi-line text field.
  - `allow other`: for `multiple` options, adds an "Other…" choice allowing
    the user to enter a free-text value.
  - `allow none`: for `multiple` options, adds a "None" choice whose value is
    the empty string.
- Option `description` fields can now contain clickable links, written either
  as bare URLs or in Markdown syntax: `[label](https://example.com)`.
- URL actions: added `spaces as plus` property. If `true`, spaces in the query
  are encoded as `+` instead of `%20` (some search engines, e.g. Amazon,
  expect this).
- JavaScript: The [auth function](/dev/api/interfaces/Extension.html#auth)
  can now return an [AuthResult](/dev/api/interfaces/AuthResult.html)
  object `{ secret, label, expiresIn }` instead of a bare secret string. The
  `label` is displayed as the signed-in account identifier (e.g. username/email), and `expiresIn` (token
  lifetime in seconds) lets PopClip treat the sign-in as expired after that
  time.
- JavaScript: New methods
  [popclip.signInRequiredError()](/dev/api/interfaces/PopClip.html#signinrequirederror)
  and
  [popclip.settingsRequiredError()](/dev/api/interfaces/PopClip.html#settingsrequirederror)
  return errors that an action can throw to send the user to the extension's
  settings UI. The former also clears the stored `authsecret`, signing the
  extension out.
- JavaScript: Added
  [popclip.openTemplateUrl()](/dev/api/interfaces/PopClip.html#opentemplateurl) method.

### Changed

- JavaScript: The extension's `name` and `icon` are now
  [static-only properties](js-modules#static-only-properties) — they can no
  longer be defined dynamically by a module.
- Holding Option (⌥) when clicking a URL or search action now performs a
  "verbatim" search: the query is wrapped in double quotes so the search
  engine treats it as an exact phrase. (This replaces the old `alternate url`
  mechanism — see below.)
- JavaScript: Updated bundled npm libraries to latest versions.

### Removed

- The `alternate url` property of URL actions has been removed. If present in
  a config, it is now ignored. The Option (⌥) key now triggers the verbatim
  search behaviour instead.
- JavaScript: Removed the `util.buildQueryUrl()` function. Use
  `popclip.openTemplateUrl()` or construct URLs with the standard `URL` class
  instead.

## PopClip 2025.9.2 (5155)

- Disable JavaScript inspectability in Safari by default. (Enable with
  `defaults write com.pilotmoon.popclip EnableJSInspection -bool true`.)
- JavaScript: Updated bundled npm libraries to latest versions.
- JavaScript: Added `valibot` and `fast-plist` to bundled npm libraries.

## PopClip 2025.9 (5118)

There were no changes to the extension programming interface in this release.

## PopClip 2024.12 (4688)

### Changed

- JavaScript extensions can access `localhost` and local network addresses
  (unqualified domains and `.local` domains) using `http:` connections. An
  `https:` connection is still required to connect to fully qualified domains.
- TypeScript sources are now transpiled with
  [sucrase](https://www.npmjs.com/package/sucrase), instead of the full
  [typescript](https://www.npmjs.com/package/typescript) library. This reduces
  the size of the PopClip application by nearly 1MB.
- When calling PopClip from the command line (to use the JavaScript test
  harness), it now prints usage information if missing or incorrect arguments
  are provided, instead of ignoring them.

### Added

- Added `oauth-1.0a` to built-in NPM modules.
- Added
  [util.hmac()](/dev/api/interfaces/Util.html#hmac)
  function for HMAC calculation (useful for extensions that need to use OAuth
  1.0a).
- Added
  [util.getRandomValues()](/dev/api/interfaces/Util.html#getrandomvalues)
  and
  [util.randomUuid()](/dev/api/interfaces/Util.html#randomuuid).
- The
  [popclip.openUrl()](/dev/api/interfaces/PopClip.html#openurl)
  method:
  - now has an `activate` option to control whether the target application is
    brought to the front. Default is `true`.
  - can now accept a [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL)
    object instead of a string. When a URL object is passed, the URL is
    serialized internally with `%20` instead of `+` for spaces. This solves a
    [mildly annoying pain-point](https://github.com/pilotmoon/PopClip-Extensions/blob/39e72253906bb5c09f523d1239b24e297fa323e7/source/Craft.popclipext/Config.ts#L43)
    for extensions that use URL objects to construct URLs.
- The
  [popclip.copyText()](/dev/api/interfaces/PopClip.html#copytext)
  method now has a `notify` option to control whether the "Copied" indicator is
  shown when the text is copied. Default is `true`.
- JavaScript API now has a global `TextEncoder` class which acts as a shim
  approximating the standard Web API class. This improves compatibility with
  some NPM modules.
- Added `isurl` [requirements](actions#the-requirements-array) key. This
  requires that the selected text is a single URL (as opposed to text
  _containing_ a url, which the existing `url` key specifies). This makes the
  `popclip.input.isUrl` property added in version 2024.5 available to
  non-JavaScript extensions.

## PopClip 2024.5.2 (4615)

### Changed

- The [JavaScript test harness](/dev/js-environment#test-harness) has been
  improved.
  - Now loads a module from a file, and optionally invokes a named function in
    that module.
  - Now supports TypeScript files.
  - Improved the tool output format.
  - Changed the command name from `runjs` to `run`.

### Added

- The
  [`popclip.showText`](/dev/api/interfaces/PopClip.html#showtext)
  method now takes an optional `style` option which can be either `compact` or
  `large`. The default style is `compact`, which is the same as the previous
  behavior. The `large` style is a new style that shows the text full-screen in
  a "large type" display.

## PopClip 2024.5 (4578)

### Added

- JavaScript extensions can now be debugged using the Safari Web Inspector. This
  lets you inspect and debug your code while it is running inside PopClip. The
  inspector can be accessed from Safari's Develop menu, which must be enabled
  with the "Show features for web developers" in Safari's Advanced settings.
- Added new `popclip.input.isUrl` property that indicates whether the input text
  is a single a web URL (as opposed to text _containing_ one or more URLs). This
  is useful for extensions that have different actions depending on whether the
  input is a URL or not.
- Added `popclip.share()` function to send text to other apps using macOS
  Sharing Extensions. I will soon update the official Notes, Messages and
  Reading List extension to use this feature.

### Fixed

- Extension requirements keys `path`, `url`, `email` now properly propagate
  their matched text as the input to Service actions.

## PopClip 2024.3 (4508)

### Added

- The text string format can now be used for all kinds of icons, e.g.
  `square filled symbol:flame`.
- Added `strike` modifier for icon strings, which overlays a strike-out effect.
- Added `flip_x`, `flip_y`, `move_x`, `move_y`, `scale` and `rotate` modifiers
  for icon strings.
- Emoji text icons now render in color.
- In the JavaScript environment, `popclip.input.regexResult` is an array
  containing the full result of the regex match, including any capture groups.
  Unlike previous PopClip versions, this array is now always available
  regardless of whether the regex was specified in the static config (as an ICU
  regex string) or in a module (as a JavaScript RegExp object).
- Added option type `secret` for storing a string in the macOS Keychain instead
  of in the PopClip preferences file. This is useful for extensions that save
  sensitive data such as a password or API key.

### Changed

- Config.json files are now parsed with a JSON parser instead of a YAML parser.
- All extensions must now have a static config defining at least `name`. An
  override name may also be specified in the dynamic (JS module) config.
- If an extension defines an `identifier`, it must be in the static config.
  Defining an identifier in dynamic config is now a load error.
- Extension identifiers now must begin and end with a letter or number.
  Separators (period, hypen or underscore) are allowed in the middle but not
  multiple in a row.
- Renamed `flip horizontal` and `flip vertical` to `flip x` and `flip y`
  respectively.
- Option labels are now optional. If omitted, the option `identifier` is used as
  the label.
- Identifier prefix `app.popclip.` is now reserved for signed extensions only.
- When an action specifies both a `regex` and a `url`, `path` or `email`
  requirement, the requirement is now applied first, and then the regex is
  applied to the output of the requirement.
- Unsigned extensions no longer purge all existing options upon installation.
  Instead, only options of type `secret` are purged, and only if an unsigned
  extension replaces a signed extension with the same identifier.
- _For Setapp edition only:_ the storage location for Extensions has changed
  from `~/Library/Application Support/com.pilotmoon.popclip-setapp/Extensions`
  to `~/Library/Application Support/PopClip/Extensions`.
- Updated all embedded NPM modules to latest versions.

### Documentation

- Updated all documentation to reflect the changes in this release. In
  particular, the [Icons](/dev/icons) page has been fully rewritten to reflect
  the new icon string features.

## PopClip 2023.9 (4225)

### Added

- TypeScript can now be used as the source language for JavaScript actions and
  module extensions. This is done by specifying a file with the `.ts`
  extension in the `javascript file` or `module` field. For snippets, specify
  `typescript` in the `language` field.
- ~~PopClip ships with a TypeScript type definitions file, `popclip.d.ts`,
  inside the app bundle.~~ _This has now been removed as of v2024.5. Instead,
  use the
  [@popclip/types NPM package](https://www.popclip.app/dev/js-environment#popclip-types-package)._
  You can configure your dev envionment to reference this to aid in developing
  your own extensions.
- URL actions can now specify an optional `alternate url`, invoked by holding
  Option (⌥).
- URL actions now have an optional `clean query` flag to clean up newlines and
  whitespace in the text before inserting into the URL.

### Changed

- Updated the versions of several of the built in NPM modules.
- Key Press actions no longer automatically wait 100ms between keypresses.
  Instead, use `wait <milliseconds>` to add a delay if needed. See
  [Wait between keypresses](/dev/key-press-actions#wait-between-key-presses).
- The Unsigned Extension warning is now only shown for extensions with Shell
  Script actions, AppleScript actions, or JavaScript actions with entitlements.
- In URL actions, leading and trailing whitespace and newlines are now always
  trimmed before URL-encoding.

### Documentation

- Amended documentation in various places to reflect the new TypeScript support.
- Added [Using `require()`](./js-environment.md#using-require) to the JavaScript
  environment documentation.
- Added [Abbreviated forms](./js-modules.md#abbreviated-forms) to the
  module-based extensions documentation.

## Documentation Update, 2023-08-30

- The developer documentation moved from GitHub to
  <https://www.popclip.app/dev/>.
- The previous single README was split into multiple pages.
- All parts revised and updated; more examples added.
- Added brand new documentation for
  [Module extensions](https://www.popclip.app/dev/js-modules).

## PopClip 2023.7 (4151)

There were no changes to the extension programming interface in this release.

## PopClip 2022.12 (4069)

### Added

- Extensions and snippets can now use icons from
  [Iconify](https://icon-sets.iconify.design/), which provides over 100,000 open
  source icons. Specify them like this: `iconify:ph:rainbow-bold`.
- Snippets can now be added as a comment header to any text file, with the
  result that the entire file becomes installable as a JavaScript, Apple Script
  or shell script extension. (See
  [Header Snippets](https://github.com/pilotmoon/PopClip-Extensions#header-snippets)
  in the main Readme.)
- PopClip will install an extension from a `.popcliptxt` file. This is basically
  a snippet in a text file.
- Added `shell script` field for specifying a shell script as a literal string.
  This allows shell scripts to be put directly in snippets.
- Added optional `stdin` field for shell scripts, to allow passing a value to
  the script via stdin.
- Allows the AppleScript source to be specified as `applescript` string or
  `applescript file` when calling a named handler.
- A `key combo` string can now specify `numpad` as a modifier, to denote
  pressing a key on the numeric keypad.
- Added options for icon drawing including `flip horizontal`, `flip vertical`
  and `preserve aspect`.
- Added built-in [core-js](https://github.com/zloirock/core-js) shim inside
  PopClip to allow modern JavaScript features on all target platforms.

### Changed

- Increased maximum selectable snippet length from 1000 to 5000 characters.
- The `script interpreter` field has been renamed to `interpreter`.
- Shell script files are no longer executed with `/bin/sh` by default. An
  interpreter must be explicitly specified.
- The `preserve image color` field has been renamed to `preserve color`.
- The `parameters` field in the `applescript call` dictionary has been renamed
  to `params`.
- Icons are now drawn in a square canvas with uniform height and width, unless
  the new `preserve aspect` flag is set.
- PopClip now enforces that the extension identifier may contain only A-Z, a-z,
  0-9, period (.), and hyphen (-).
- Updated the versions of several of the built in NPM modules.
- When an action combines both `requirements` and `regex`, the requirements are
  now applied first, and then the regex is applied to the result.

### Fixed

- The snippet detector now correctly recognizes snippets written in YAML flow
  syntax (i.e. with braces `{}`), as well as JSON syntax (since valid JSON is
  valid YAML).
- Fixed never-ending spinner with some Shortcuts actions.

## PopClip 2022.5 (3895)

### Added

- Added the ability to execute pre-compiled AppleScript `.scpt` files, and to
  invoke handlers within them with parameters.
- Key Press extensions can now take an array of key combos, to press a sequence
  of keys.
- Extended the key code string format to simplify specifying non-character keys,
  and raw key codes. For example: `command tab`.
- Brought back the `restore pasteboard` field for actions.
- Added a 'test harness' mode to PopClip, for testing your JavaScript code in
  the PopClip environment. Run as:
  `/Application/PopClip.app/Contents/MacOS/PopClip runjs <filename>`
- Additions to the JavaScript programming environment:
  - Added RTF processing features (via RichText class object).
  - Added locale information to the `util` object.
  - Added a promise-based global function `sleep` (e.g. `await sleep(1000)`).
  - Supports the new key combo string format in the `popclip.pressKey()` method.
  - Improvements to the XMLHttpRequest implementation, including adding `Blob`
    and `ArrayBuffer` support.

### Changed

- For Key Press extensions, there is now a 100ms delay after each key press.
- Updated the versions of some of the bundled npm libraries for JavaScript
  extensions. (There should be no breaking changes.)

## PopClip 2021.11 (3785)

### Added

- PopClip will now load either JSON (`Config.json`) or YAML (`Config.yaml`) as
  an alternative to an XML Property List (`Config.plist`) for the extension
  config file. The same field names are used in each of the three formats, and
  they each define the same logical structure. The choice of format is just a
  matter of which you prefer. (I'm currently leaning towards YAML for the best
  readability.)
- Field names for use in the Config files are now defined in a spaced lowercase
  form such as `applescript file`. However, PopClip will accept field names in
  all common forms including the original "spaced capitalized" form (e.g.
  `AppleScript File`) and camel case (e.g. `applescriptFile`).
- The `URL` field for Search extensions will now accept `***` in addition to
  `{popclip text}` as the placeholder.
- The text-based icon format has a new "magnifying glass" style, intended for
  search extensions.
- The text-base icon specification format has changed since 2021.10 (see
  README).
- The `Script Interpreter` can now be specified as a bare executable name (e.g.
  `perl`), and PopClip will locate the tool in the `PATH` of the user's default
  shell.
- Added a new field called `AppleScript`, allowing AppleScripts to be specified
  as a verbatim text string in the config file (rather than as a separate file
  via `AppleScript File`).
- Allow key combos to be specified as a text string, for example
  `command option T`.
- Added an `emails` requirement to specify one or more email addresses.
- Added `POPCLIP_EMAILS` and `POPCLIP_PATHS` fields.
- Added Shortcut action type, to run a named Shortcut on macOS 12.0.
- Added JavaScript action type.

### Changed

- Removed the `Extension ...` and `Option ...` prefixes from field names (e.g.
  `Extension Name` is now just `Name`). The old names will continue to work.
- The extension's `Identifier` and/or `Name` are now optional. If either is
  omitted, popclip will generate one from the .popclipext package name.
- An action's `Title` is now optional. If omitted, the action takes the
  extension's name as its title.
- An action's `Icon` is now optional. If omitted, the action takes the
  extension's icon (if any) as its icon.
- The `Actions` array is now optional. An extension with a single action may now
  be specified at the top level of the config file, without a separate action
  dictionary.
- Renamed `Blocked Apps` to `Excluded Apps`, `Regular Expression` to `Regex`,
  `Pass HTML` to `Capture HTML`, `Required Software Version` to
  `PopClip Version`, and `Required OS Version` to `MacOS Version`. The old names
  will continue to work.
- Renamed the requirements `httpurl` and `httpurls` to `url` and `urls`.
- When URLs without a scheme prefix are detected in text, PopClip now defaults
  to https instead of http.
- Changed the text icon specification format. (Docs todo.)

### Note

My goal with these recent changes is to drastically lower the barrier of entry
for users creating their own extensions. The changes mean that extensions can
now be defined with fewer fields and less structure.

As the cherry on top of that, PopClip now has a new built in action for
installing extensions from selected text. It activates when you select text
starting with `# popclip` followed by a YAML extension definition. The extension
must be a URL, Service or Key Press extension. Here is an example:

```yaml
# popclip extension to search Emojipedia
name: Emojipedia
icon: search filled E
url: https://emojipedia.org/search/?q=***
```

This means simple extensions can be shared simply by plain text in emails, on
websites etc. Extensions shared this way don't also show an unsigned extension
warning.

There is limit of 1000 characters for this. (If you are doing anything requiring
more than that, you should probably be creating a packaged extension.)

## PopClip 2021.10 (3543)

### Added

- Executable shell scripts now have the user's `PATH` set in the script
  variables.
- Brought back `Preserve Image Color`.

### Changed

- The `App` specifier can now be set on individual actions as well as at the
  root level.

### Deprecated

- ~~The `Script Interpreter` field is deprecated.~~ _Reverted - see later
  changes to this field._

## PopClip 2021.9 (3510)

### Added

- PopClip now supports SVG image files as well as allowing you to specify an
  image as a SF Symbols identifier or to generate an icon from up to 3 letters
  of text.
- PopClip now provides an HTML and a Markdown version for _all_ text selections,
  when `Pass HTML` is set. When the content is not HTML backed, the HTML and
  Markdown is generated from the selected RTF or plain text content.
- Added `POPCLIP_MARKDOWN` field to contain the markdownified HTML.
- Added `POPCLIP_ACTION_IDENTIFIER` field. This is passed to the action script
  allowing you to use the same script for multiple actions.
- Added `POPCLIP_FULL_TEXT` field. This is always contains the full selected
  text in cases where `POPCLIP_TEXT` only contains the part of text matched by
  regex or requirement.
- Added `Option Value Labels` array so that the options list can show a display
  name different to option string value itself.
- Added `Option Description` field to add more information in the UI about an
  option.
- Shell scripts with the executable bit set can optionally specify their
  interpreter with a hashbang, instead of the `Script Interpreter` field.

### Removed

- Removed the `html` requirement since all selections now come with HTML (as
  above).
- ~~Removed the `Preserve Image Color` option. PopClip now always converts the
  icon to monochrome.~~ _Restored in 2021.10._
- ~~Removed the `Restore Pasteboard` option. PopClip now always restores the
  pasteboard, unless using the `*-result` keys.~~
- Removed the `Long Running` option. All extensions are now assumed to be
  potentially long running.

### Changed

- The `POPCLIP_HTML` field is now sanitized to remove CSS, potentially unsafe
  tags, and to fix invalid markup. The unsanitized HTML is still available in a
  new field `POPCLIP_RAW_HTML`.
- Renamed the `Image File` and `Extension Image File` fields to `Icon` and
  `Extension Icon`, respectively. (The old names will also still work but are no
  longer documented.)
- Added `App` dictionary field to specify a single app (since it turns out we
  hardly ever need to specify more than one app). (`Apps` array will still work
  but is no longer documented.)
- The error checking when loading an extension is more robust, so errors such as
  incorrect field types will now be caught. And you'll get an more specific
  message about what the problem is.

One more thing... there is also a brand new extension format based on
JavaScript. Documentation still "to-do", watch this space!
