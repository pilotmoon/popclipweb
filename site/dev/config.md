---
outline: deep
---

# The config dictionary

Every extension is defined by a config dictionary. This can be provided either
by a a [package](./packages) or a [snippet](./snippets), but in each case the
underlying structure is the same. Values can be strings, numbers, booleans,
`null`, arrays or other dictionaries.

::: tip Key names

PopClip is very flexible about how you name keys. In this documentation you'll
see keys named in lowercase with spaces, for example `required apps`.

However, PopClip will treat `Required Apps`, `requiredApps`, `RequiredApps`,
`required_apps`, `required-apps` and `REQUIRED_APPS` as equivalents. It doesn't
matter what form you use and you can mix formats in the same file.

The full range of formats is as defined by
[case-anything](https://github.com/mesqueeb/case-anything), which PopClip uses
internally.

Additonally, older versions of PopClip used different names for some fields.
Where there is a new name, the old name is also still accepted. A table of old
and new names is given in [Key name mapping](/).

:::

## Top level properties

The following fields are used at the top level of the config to define
properties of the extension itself. All fields are optional except `name`.

| Key               | Type                 | Description                                                                                                                                                                                                                                                                                                               |
| ----------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name` (Required) | String (Localizable) | A short, human-readable display name for this extension.                                                                                                                                                                                                                                                                  |
| `icon`            | String               | See [Icons](#icons). If you omit this field, the icon for the first action will be used (if any), or else no icon will be displayed.                                                                                                                                                                                      |
| `identifier`      | String               | You may provide an identifier string here to uniquely identify this extension. See [Identifier field](#identifier-field).                                                                                                                                                                                                 |
| `description`     | String (Localizable) | A short, human readable description of this extension. Appears on the web site but not in the app.                                                                                                                                                                                                                        |
| `macos version`   | String               | Minimum version number of Mac OS X needed by this extension. For example `10.8.2` or `11.0`.                                                                                                                                                                                                                              |
| `popclip version` | Integer              | Minimum PopClip version required. This is specified as the integer build number. You should specify `4069` for new extensions based on this document. Specifying a version here can also help preserve your extension's functionality in future, because PopClip applies backward-compatibility rules for old extensions. |
| `options`         | Array                | Array of dictionaries defining the options for this extension, if any. See [The `options` array](#the-options-array).                                                                                                                                                                                                     |
| `options title`   | String (Localizable) | Title to appear at the top of the options window. Default is `Options for <extension name>`.                                                                                                                                                                                                                              |
| `entitlements`    | Array                | Only applies to JavaScript extensions. The possible values are `network` (allows use of XMLHttpRequest) and `dynamic` (allows dynamically generated actions).                                                                                                                                                             |
| `action`          | Dictionary           | A dictionary defining a single action for this extension. See [Action properties](#action-properties).                                                                                                                                                                                                                    |
| `actions`         | Array                | Array of dictionaries defining the actions for this extension.                                                                                                                                                                                                                                                            |

If neither `actions` nor `action` is defined, PopClip will look at the top level
of the plist for an action definition.

### Identifier field

An identifier may contains only alphanumeric characters (A-Z, a-z, 0-9), period
(.), and hyphen (-). Use your own prefix, which could be a reverse DNS-style
prefix based on a domain name you control `com.example.myextension`. If you omit
this field, PopClip will identify the extension by its package name (e.g.
`Name.popclipext`) instead.

::: warning Reserved identifier

The identifier prefix `com.pilotmoon.` is reserved for signed extensions
published by me. If you try to use it for your own extensions, you'll get an
error.

:::

## Action properties

The following fields define properties common to all actions. All fields are
optional.

Action properties can also be set in the extension properties section.
Properties set at the top level will apply to all actions (unless overridden in
the individual action )

| Key                  | Type                 | Required?                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Description |
| -------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `title`              | String (Localizable) | The title is displayed on the action button if there is no icon. For extensions with icons, the title is displayed in the tooltip. If omitted, the action will take the extension name as its title.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |             |
| `icon`               | String               | The icon to show on the action button. See [Icons](#icons) for the icon specification format. If omitted, the action will take the extension icon as its icon. To explicitly specify no icon, set this field either to boolean `false` (in a plist) or to `null` (in JSON/YAML).                                                                                                                                                                                                                                                                                                                                                                                                        |             |
| `identifier`         | String               | A string to identify this action. In shell script and AppleScript actions, the identifier is passed to the script.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |             |
| `requirements`       | Array                | Array consisting of zero or more of the strings listed in [the `requirements` array](#the-requirements-array). All the requirements in the array must be satisfied. If the array is omitted, the requirement `text` is applied by default.                                                                                                                                                                                                                                                                                                                                                                                                                                              |             |
| `before`             | String               | String to indicate an action PopClip should take _before_ performing the main action. See [The `before` and `after` strings](#the-before-and-after-strings).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |             |
| `after`              | String               | String to indicate an action PopClip should take _after_ performing the main action. See [The `before` and `after` strings](#the-before-and-after-strings).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |             |
| `excluded apps`      | Array                | Array of bundle identifiers of applications. The action will not appear when PopClip is being used in any of the the specified apps.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |             |
| `required apps`      | Array                | Array of bundle identifiers of applications. The action will only appear when PopClip is being used in one of the specified apps. _Note: This field does not make PopClip do a check to see if the app is present on the computer. For that, use the `App` field._                                                                                                                                                                                                                                                                                                                                                                                                                      |             |
| `regex`              | String               | A [Regular Expression](http://regularexpressions.info/) to be applied to the selected text. The action will appear only if the text matches the regex, and the matching part of the text is passed to the action. The regex engine used is Cocoa's `NSRegularExpression`, which uses the [ICU specification](https://unicode-org.github.io/icu/userguide/strings/regexp.html) for regular expressions. _Note: There is no need to use your own regex to match URLs, email addresses or file paths. Use one of the `requirements` keys `url`, `urls`, `email`, `emails` or `path` instead. Also be careful to avoid badly crafted regexes which never terminate against certain inputs._ |             |
| `app`                | Dictionary           | Information about the app or website associated with this action. You can use this field to, optionally, specify that a certain app must be present on the system for the action to work. See [The `app` dictionary](#the-app-dictionary).                                                                                                                                                                                                                                                                                                                                                                                                                                              |             |
| `stay visible`       | Boolean              | If `true`, the PopClip popup will not disappear after the user clicks the action. (An example is the Formatting extension.) Default is `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |             |
| `capture html`       | Boolean              | If `true`, PopClip will attempt to capture HTML and Markdown for the selection. PopClip makes its best attempt to extract HTML, first of all from the selection's HTML source itself, if available. Failing that, it will convert any RTF text to HTML. And failing that, it will generate an HTML version of the plain text. It will then generate Markdown from the final HTML. Default is `false`.                                                                                                                                                                                                                                                                                   |             |
| `restore pasteboard` | Boolean              | If true, then PopClip will restore the pasteboard to its previous contents after pasting text in the `paste-result` after-step. Default is `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |             |

Additionally, there will be action-specific properties as defined in the
documentation for each action type.

### The `requirements` array

These are the values supported by the `requirements` array. Additionally, you
can prefix any requirement with `!` to negate it.

| Value        | Description                                                                                                                                                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`       | One or more characters of text must be selected.                                                                                                                                                                                 |
| `copy`       | Synonym for `text` (for backward compatibility).                                                                                                                                                                                 |
| `cut`        | Text must be selected and the app's Cut command must be available.                                                                                                                                                               |
| `paste`      | The app's Paste command must be available.                                                                                                                                                                                       |
| `url`        | The text must contain exactly one web URL (http or https). _(see side effects below)_                                                                                                                                            |
| `urls`       | The text must contain one or more web URLs (https or https).                                                                                                                                                                     |
| `email`      | The text must contain exactly one email address. _(see side effects below)_                                                                                                                                                      |
| `emails`     | The text must contain one or more email addresses.                                                                                                                                                                               |
| `path`       | The text must be a local file path, and it must exist on the local file system. _(see side effects below)_                                                                                                                       |
| `formatting` | The selected text control must support formatting. (PopClip makes its best guess about this, erring on the side of a false positive.)                                                                                            |
| `option-*=#` | The option named `*` must be equal to the string `#`. For example `option-fish=shark` would require an option named `fish` to be set to the value `shark`. This mechanism allows actions to be enabled and disabled via options. |

#### Note on side effect of requirements field

When using a `url`, `email` or `path` requirement, the text passed to the action
will be modified.

- For `url` requirement, only the matching URL will be passed, and it will be
  expanded to its full form, with `https://` prepended if no scheme is
  specified. For example, if the selected text is `go to apple.com`, the text
  passed to the action will be `https://apple.com`.
- For `email` requirement, the only the matching email address will be passed to
  the action.
- For `path` requirement, only the matching path will be passed to the action,
  and it will be standardized form with `~` and `..` expanded. For example
  `~/Documents` will be passed as `/Users/username/Documents`.

In all three cases, actions can assume that their input is a valid web URL,
email address or path.

Shell Scripts and AppleScripts can still access the original text in the
`POPCLIP_FULL_TEXT` and `{popclip full text}` fields. JavaScript actions will
find the modified text as `popclip.input.matchedText` and the full text as
`popclip.input.text`.

### The `before` and `after` strings

The `cut`, `copy` and `paste` keys can be used as the `before` string. All the
values can be used as the `after` string.

| Value            | Description                                                                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `copy-result`    | Copy the text returned from the script to the clipboard. Displays "Copied" notification.                                                                                              |
| `paste-result`   | If the app's Paste command is available, paste the text returned from the script, as well as copy it to the clipboard. Otherwise, copy it as in `copy-result`.                        |
| `preview-result` | Copy the result to the pasteboard and show the result to the user, truncated to 160 characters. If the app's Paste command is available, the preview text can be clicked to paste it. |
| `show-result`    | Copy the result to the pasteboard and show it to the user, truncated to 160 characters.                                                                                               |
| `show-status`    | Show a tick or an 'X', depending on whether the script succeeded or not.                                                                                                              |
| `cut`            | Invoke app's Cut command, as if user pressed ⌘X.                                                                                                                                      |
| `copy`           | Invoke app's Copy command, as if user pressed ⌘C.                                                                                                                                     |
| `paste`          | Invoke app's Paste command, as if user pressed ⌘V.                                                                                                                                    |
| `paste-plain`    | Reduce the current clipboard to plain text only, then invoke app's Paste command.                                                                                                     |
| `popclip-appear` | Trigger PopClip to appear again with the current selection. (This is used by the Select All extension.)                                                                               |
| `copy-selection` | Place the original selected text to the clipboard. (This is used by the Swap extension.)                                                                                              |

### The `app` dictionary

The `app` field is a dictionary with the following stricture:

| Key                  | Type    | Required?                               | Description                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------- | ------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`               | String  | Required                                | Name of the app which this extension interacts with. For example `Evernote` for an Evernote extension.                                                                                                                                                                                                                                                                       |
| `link`               | String  | Required                                | Link to a website where the user can get the app referred to in `Name`. For example `https://evernote.com/`.                                                                                                                                                                                                                                                                 |
| `check installed`    | Boolean | Optional                                | If `true`, PopClip will check whether an app with one of the given `Bundle Identifiers` is installed when the user tries to use the extension. None is found, PopClip will show a message and a link to the website given in `Link`. Default is `false`.                                                                                                                     |
| `bundle identifiers` | Array   | Required if `check installed` is `true` | Array of bundle identifiers for this app, including all application variants that work with this extension. In the simplest case there may be just one bundle ID. An app may have alternative bundle IDs for free/pro variants, an App Store version, a stand-alone version, a Setapp version, and so on. Include all the possible bundle IDs that the user might encounter. |

### The `options` array

Options are presented to the user in a preferences user interface window and are
saved in PopClip's preferences on behalf of the extension. Options appear in the
UI in the order they appear in the `options` array. An option dictionary has the
following structure.

| Key             | Type                 | Required?                    | Description                                                                                                                                                                                                                                                                                                                             |
| --------------- | -------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `identifier`    | String               | Required                     | Identifying string for this option. This is passed to your script. The identifier will be downcased or upcased for AppleScript and Shell Script targets, respectively — see [Script Fields](#script-fields).                                                                                                                            |
| `type`          | String               | Required                     | One of the following: `string` (text box for free text entry), `boolean` (a check box), `multiple` (pop-up box with multiple choice options), `heading` (not actually an option, but serves as a heading in the prefs window) or `password` (password entry field). Passwords are stored in user's keychain instead of app preferences. |
| `label`         | String (Localizable) | Required                     | The label to appear in the UI for this option.                                                                                                                                                                                                                                                                                          |
| `description`   | String (Localizable) | Optional                     | A longer description to appear in the UI to explain this option.                                                                                                                                                                                                                                                                        |
| `default value` | String               | Optional                     | This field specifies the default value of the option. If omitted, `string` options default to the empty string, `boolean` options default to `true`, and `multiple` options default to the top item in the list. A `password` field may not have a default value.                                                                       |
| `values`        | Array                | Required for `multiple` type | Array of strings representing the possible values for the multiple choice option.                                                                                                                                                                                                                                                       |
| `value labels`  | Array                | Optional                     | Array of "human friendly" strings corresponding to the multiple choice values. This is used only in the PopClip options UI, and is not passed to the script. If omitted, the option values themselves are shown.                                                                                                                        |
| `inset`         | Boolean              | Optional                     | If true, the option field will be shown inset to the right of the label, instead of under it. Default is false.                                                                                                                                                                                                                         |

## Format

### Localizable Strings

Fields shown as "String (Localizable)" type may be either a string or a
dictionary. If you supply a string, that string is always used. Alternatively,
you can supply a dictionary mapping language codes (`en`, `fr`, `zh-hans`, etc.)
to strings, and PopClip will display the string for the user's preferred
language if possible, with fallback to the `en` string, which is always
required.

### Null values

Plist does not have a native way to represent the `null` value of JSON and YAML.
In PopClip extensions, you use `<false />` in a Plist where you would use `null`
in JSON or YAML.
