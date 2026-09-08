---
name: popclip-extension-authoring
description: 'How to write, modernize and maintain PopClip extensions the way the official ones are written today: TypeScript Config.ts code snippets with a `// #popclip` header, typed options via InferOptions and defineExtension(), and shell commands run from JavaScript with the `$` tag. Use this whenever the task involves creating or editing a .popclipext package, a Config.ts/.js/.yaml, a PopClip snippet, extension options, entitlements, popclipVersion, or migrating an old YAML/plist/shell-script extension to JavaScript, even if the user just says "update this extension" or "add an option".'
---

# Authoring PopClip extensions

PopClip's extension format has changed a lot, and most of what the web (and
model memory) knows about it is out of date. Check current behaviour against
the sources below before relying on anything here. This file records
decisions and gotchas, not the manual.

## Sources of truth

Read these in preference to search results. Cached search results have been
seen to serve "Beta / Unreleased" versions of these pages; loading the page
directly gives the shipped state.

- **Developer docs**: https://www.popclip.app/dev/ — every page has a plain
  Markdown twin (append `.md` to the URL). Start with
  [js-modules.md](https://www.popclip.app/dev/js-modules.md),
  [external-scripts.md](https://www.popclip.app/dev/external-scripts.md),
  [options.md](https://www.popclip.app/dev/options.md),
  [top-level-properties.md](https://www.popclip.app/dev/top-level-properties.md)
  and the top entry of
  [changelog.md](https://www.popclip.app/dev/changelog.md), which names the
  current release and build number. The whole reference is one file at
  https://www.popclip.app/dev/all.md, indexed by https://www.popclip.app/llms.txt.
- **API reference**: https://www.popclip.app/dev/api/, generated from
  [popclip.d.ts](https://www.popclip.app/dev/popclip.d.ts). The same file is
  the npm package `@popclip/types`, and is the most precise statement of what
  each function accepts and returns.
- **Reference extensions** in
  https://github.com/pilotmoon/PopClip-Extensions/tree/master/source:
  `Say.popclipext/Config.ts` (shell tag, validated numeric option),
  `OpenAIChat.popclipext/Config.ts` (typed options, network, several actions),
  `PasteAndMatch`, `Shuffle` and `Brackets` (small module extensions).
- **Directory rules**: https://www.popclip.app/extensions/submit — required
  fields, size limits, shell script policy, excluded files.

## First decide: snippet or package?

The same source works in two deliveries, and the user usually has one in mind
without saying so. Work out which before writing anything.

- **A snippet** is plain text the user installs by selecting it. Choose this
  when the request arrives in conversation with no repository in play, when
  the user asks for something they can paste or select, or when it is a
  one-off for their own use. Deliver the whole text in one code block, ready
  to select; a pasted snippet may be up to 5,000 characters. A snippet cannot
  carry files, so icons must be text, Iconify or SF Symbols, and there is no
  readme. `identifier`, `description` and `keywords` are optional; a
  reinstall with the same `name` replaces the old copy.
- **A package** is a `Name.popclipext` folder. Choose this when working
  inside a repository, especially one that already holds `.popclipext`
  folders or a `popclip-directory.yaml`, when the user wants to publish or
  submit, or when the extension needs bundled files (icon images, a readme,
  extra modules or scripts). Create or update the folder in place and follow
  the repository's existing conventions: folder naming, tsconfig, readme
  changelog. Fill in `identifier`, `description`, `keywords` and
  `popclipVersion`; the directory rejects a package without them.

If the signals conflict, ask. Switching later is cheap: a snippet becomes a
package by saving the same text as `Config.ts` inside a `.popclipext`
folder, and a package's `Config.ts` can be opened as a snippet file.

## Default shape: a TypeScript code snippet

For anything with code, write a TypeScript code snippet: a YAML comment
header under `// #popclip`, then the module body. Deliver it as text, or as
`Config.ts` inside a package folder. PopClip transpiles TypeScript itself (no build step, no type
checking at load), so TypeScript costs nothing at runtime and buys editor
completion plus `tsc` checking.

```typescript
// #popclip
// identifier: com.example.read-aloud
// name: Read Aloud
// icon: iconify:iconmind:speech-outline-regular
// popclipVersion: 6221
// entitlements: [script]
// description: Speak the selected text aloud using the macOS say command.
// keywords: speak speech voice tts

const options = [
  {
    identifier: "voice",
    label: "Voice",
    type: "string",
    description:
      "Name of a macOS voice, for example Daniel. Leave blank for the system default.",
  },
] as const;

type ReadAloudOptions = InferOptions<typeof options>;

defineExtension<ReadAloudOptions>({
  options,
  action: async (input, options) => {
    await $`say ${options.voice ? ["-v", options.voice] : []} ${input.text}`;
  },
});
```

Points that matter:

- **The header holds the static metadata.** `name`, `icon`, `identifier`,
  `popclipVersion`, `macosVersion`, `entitlements`, `module`, `showAs` and
  `offersMultipleInstances` are static-only: the module cannot set or override
  them. Directory fields (`description`, `keywords`, `app`) belong there too.
  Everything else can live in either place; prefer code for anything computed.
- **camelCase keys.** PopClip accepts any key style, but the docs and the
  official extensions use camelCase (`popclipVersion`, `captureHtml`,
  `keyCombo`).
- **No `language` or `module` keys** in a `Config.ts`: the `.ts` suffix picks
  the language, and the exports (or the `defineExtension()` call) mark it as
  a module. For a *pasted* snippet the same inference needs PopClip 2026.8.1
  (build 6221) or later; earlier versions fail with "Specify language or
  interpreter". Older extensions that carry `language:` or `module: true`
  still work; remove them when raising `popclipVersion` anyway.
- **`popclipVersion` is the app's integer build number** (for example 6221),
  not the `@popclip/types` package version. Set it to the build you tested
  against, or the oldest build that has every feature you use. Look the
  current build up in the dev changelog rather than assuming it.
- **Icons: prefer Iconify** (`iconify:<set>:<name>`, catalogue at
  https://icon-sets.iconify.design/). It is the encouraged source, with a far
  larger vocabulary than SF Symbols (`symbol:`), whose licence is aimed at
  apps. A bundled SVG or PNG file works in a package; short text works for
  quick snippets. See https://www.popclip.app/dev/icons.md.
- **Entitlements** are `network` (XMLHttpRequest and the bundled HTTP
  libraries), `script` (shell and AppleScript from JavaScript) and `dynamic`
  (population and submenu functions). `dynamic` cannot be combined with either
  of the other two.
- **Prefer `defineExtension()`** over bare `export` for the extension object.
  It is the same thing at runtime but typed. Never mix a default export with
  named exports; that is a load error.

No-code actions (URL, key press, Service, Shortcut) are still best as a plain
YAML `Config.yaml`. Don't wrap a one-line `url:` in a module.

## Options: declare once, infer the type

Declare the options array `as const`, derive the type with
`InferOptions<typeof options>`, and pass it as `defineExtension`'s type
parameter so action functions see the real identifiers and value types.
`heading` and `password` options carry no value and drop out of the inferred
type; `boolean` infers as `boolean`, everything else as `string`.

- Pick a distinct name for the inferred type (`SayOptions`, `ReadAloudOptions`).
  `Options` is already a global type in `popclip.d.ts`, and a `Config.ts`
  with no `import` or `export` is script-scoped for `tsc`, so
  `type Options = …` fails with a duplicate identifier.
- The option `description` is the user-facing guidance and may contain links.
  Put ranges, formats and "leave blank for…" behaviour there.
- **The option `identifier` is the storage key** for the user's saved value,
  and **the extension `identifier` is permanent** once in the directory. Keep
  both unchanged through any rewrite; a renamed option silently loses the
  user's setting. `migrateFrom` (6221+, `string` and `multiple` only) exists
  for when a rename is unavoidable.
- Requirements can gate an action on an option:
  `requirements: ["option-showReset=1"]`.

### Numeric settings

There is **no numeric option type** and no built-in numeric validation. Take
the value as a `string` option and validate in code, in this order:

1. Decide what blank means (usually "use the default") and handle it *before*
   converting. `Number("")` is `0`, which looks like a valid number.
2. Convert, reject anything that fails `Number.isFinite`, then check the range
   the extension actually needs. If you round, round a value already known to
   be in range, so rounding cannot push it outside.
3. Throw `popclip.settingsRequiredError()` on failure, and do all of this
   **before** running any shell command or network call, so bad input never
   reaches them.

The exact range, rounding and blank policy belong to each extension. Say uses
1–1000 words per minute and rounds to whole numbers; that is Say's choice, not
a rule.

### Signalling bad settings

`throw popclip.settingsRequiredError(message)` sends the user to the
extension's settings without clearing any sign-in; `popclip.signInRequiredError()`
also clears the stored credential. The optional message is for logs and
diagnostics. Do not rely on it being shown to the user; put the explanation
the user needs in the option's `description`.

## Running shell commands from JavaScript

Prefer a JavaScript action that calls out over a classic Shell Script action.
The directory requires a `shellScriptRationale` for classic Shell Script
actions; JavaScript with the `script` entitlement is the preferred route.

- **The `$` shell tag** for one-liners: `` await $`say ${text}` ``. It runs
  `/bin/zsh` with `set -euo pipefail`. Every `${...}` is shell-escaped into a
  single word, so **never add your own quotes** around an interpolation.
  Arrays splice in as separate words (handy for optional flags), and a
  previous result splices in as its trimmed stdout. The template text is raw:
  write shell variables as `$VAR`, not `${VAR}` (JavaScript claims that), and
  mind strict mode by probing unset variables as `${VAR:-}`.
- **`popclip.runShellScript(source, { interpreter, env, shellMode, prefix })`**
  and **`popclip.runShellScriptFile(path, { …, stdin, arguments })`** when you
  need another interpreter, a script file shipped in the package, stdin or
  positional arguments, or the user's login shell environment
  (`shellMode: "login"`; the default `"none"` runs the interpreter directly
  with a minimal PATH). Pass data via `env`, `stdin` or `arguments`, never by
  composing it into the source.
- Both need `entitlements: [script]` and work **only in the action phase**:
  not at load time, and not in a population or submenu function.
- A non-zero exit rejects the promise with `status`, `stdout` and `stderr`
  attached. Await the promise (or return it) from the action so PopClip can
  show the spinner, catch the failure and let the user cancel.
- Only strings feed the `-result` after-steps: return `` `${result}` ``, not
  the result object.

## Checking your work

- **Type check** with `@popclip/types` installed
  (`npm install -D typescript @popclip/types`, then `npx tsc --noEmit`). A
  tsconfig needs only `"lib": ["ES2023"]`, `"types": ["@popclip/types"]`,
  `"module": "preserve"`, `"moduleResolution": "bundler"`,
  `"verbatimModuleSyntax": true`, `"strict": true` and `"noEmit": true`. Do
  not add `dom` to `lib` or `node` to `types`; they make code type-check that
  cannot run in PopClip.
- **Validation changes** deserve a table of cases: default and blank, each
  boundary, a value just outside each boundary, non-numeric and non-finite
  input, and confirmation that invalid input throws before any command runs.
- **Say what was actually tested.** A mocked `popclip` or `$` in Node
  exercises your logic but not PopClip. Real runtime checks are: installing
  the package (double-click) and clicking the action; the test harness
  `/Applications/PopClip.app/Contents/MacOS/PopClip run file.ts fn` (blank
  `popclip` data, `print()` for output); and the debug log
  (`defaults write com.pilotmoon.popclip EnableExtensionDebug -bool YES`,
  restart PopClip, then Console.app filtered to process PopClip, category
  Extension).

## Migrating an old extension

When rewriting a plist, YAML or shell-script extension as a `Config.ts`:

1. Keep `identifier`, `name`, the icon file, and every option `identifier`
   and default. Keep the package folder name and repo path; the directory
   refuses moved packages.
2. Replace the old `Config.*` entirely. A package has one config file.
3. Raise `popclipVersion` to the build you tested on, and state the new
   minimum in the readme.
4. Carry over behaviour, not structure: an old shell script's argument
   building becomes an array spliced into `$`; `POPCLIP_OPTION_FOO` becomes
   `options.foo`; exit code 2 becomes `settingsRequiredError()`.
5. Record the change in the readme's changelog with the date, what changed
   and the new minimum version. The directory shows the readme.
6. Files or folders starting with `_` or `.` are stripped from the published
   package; use that for tests and scratch files.

## Things to avoid

- Hard-coding "the current release" as a rule: it moves. State the build a
  feature appeared in when that is the point; otherwise look it up.
- Copying doc pages into an extension's readme. Link, and keep the readme
  focused on usage.
- Network or script work in a population function, or reading `secret`
  options there; both are refused.
