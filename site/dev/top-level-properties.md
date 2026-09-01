---
outline: deep
titleTemplate: :title — PopClip Developer
---

# Top-level properties

The following keys are used at the top level of the [config](./config) to
define properties of the extension itself. All properties are optional except
`name`.

| Key                         | Type                 | Description                                                                                                                                                                                                                                                                               |
| --------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name` (Required)           | String (Localizable) | A short, human-readable display name for this extension.                                                                                                                                                                                                                                  |
| `icon`                      | String               | See [Icons](./icons). If you omit this field, the icon for the first action will be used (if any), or else no icon will be displayed.                                                                                                                                                     |
| `identifier`                | String               | You may provide a string to uniquely identify this extension. See [The `identifier` field](#the-identifier-field).                                                                                                                                                                        |
| `description`               | String (Localizable) | A short, human readable description of this extension. Appears in the [directory](/extensions/) but not in the app.                                                                                                                                                                       |
| `keywords`                  | String               | Space-separated words to help people find your extension in the [directory](/extensions/), whose search matches case-insensitively against the name and keywords but not the description.                                                                                                 |
| `macos version`             | String               | Minimum version number of Mac OS X needed by this extension. For example `10.8.2` or `11.0`.                                                                                                                                                                                              |
| `popclip version`           | Integer              | Minimum PopClip version required. This is the integer build number e.g. `4151`. Specifying the current PopClip version here can help preserve your extension's functionality in future, because PopClip applies backward-compatibility rules for old extensions.                          |
| `options`                   | Array                | Array of dictionaries defining the options for this extension, if any. See [Options](./options).                                                                                                                                                                                          |
| `entitlements`              | Array                | Only applies to JavaScript extensions. The possible values are `network` (allows use of XMLHttpRequest), `dynamic` (allows dynamically generated actions) and `script` (allows use of `popclip.runAppleScript()`, `runAppleScriptFile()`, `runShellScript()` and `runShellScriptFile()`). |
| `action` or `actions`       | Dictionary or Array  | A dictionary or array of dictionaries defining the action(s) for this extension. See [Action properties](./actions).                                                                                                                                                                      |
| `submenu`                   | Array                | Makes the extension a single button that opens a submenu of child actions. See [Submenus](./actions#submenus).                                                                                                                                                                            |
| `show as`                   | String               | Sets the default presentation of the extension's actions in the PopClip bar: `icon` or `text`. If omitted, the default is `icon`. (The user can override this per action.)                                                                                                                |
| `auth service label`        | String (Localizable) | For extensions with a sign-in (`auth` function): a label identifying the service to which the user is being asked to sign in. Used in UI prompts like _Sign in to your [label] account_. If omitted, the extension name is used.                                                          |
| `auth keychain`             | String               | For extensions with a sign-in (`auth` function): which keychain the sign-in secret goes in. `sync` (the default) shares one sign-in across the user's devices via iCloud Keychain; `local` keeps it on the Mac where the user signed in, so each device signs in separately.              |
| `offers multiple instances` | Boolean              | Controls whether PopClip enables the Duplicate and New Instance commands for this extension. By default, PopClip allows multiple instances if the action has any options. Setting this property will override the automatic behavior.                                                     |
| `shell script rationale`    | String               | A brief explanation of why the extension needs a [Shell Script action](./shell-script-actions) instead of JavaScript. Not used by the app; required when [submitting](/extensions/submit#shell-script-policy) an extension with a Shell Script action to the directory.                   |

## The `identifier` field

An identifier may contain only alphanumeric characters (`A-Z`, `a-z`, `0-9`),
period (`.`), and hyphen (`-`).

A good identifier should be globally unique so as not to clash with other
creators. Use your own prefix, which could be a reverse DNS-style prefix based
on a domain name you control, such as `com.example.myextension`. Alternatively,
just pick something likely to be unique to you.

If you don't provide an `identifier`, PopClip will identify the extension by the
package directory name (e.g. `Name.popclipext`) if it's a package extension, or
the `name` if it's a snippet.

::: warning Reserved identifier

The identifier prefix `com.pilotmoon.` is reserved for signed extensions
published by me. If you try to use it for your own extensions, you'll get an
error.

:::
