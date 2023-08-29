---
outline: deep
---

# The config dictionary

Every extension is defined by a config dictionary. This can be provided either
by a [snippet](./snippets) or a [package](./packages), but in each case the
underlying structure is the same.

::: tip Key names

PopClip is very flexible about how you name keys. In this documentation you'll
mostly see keys named in lowercase with spaces, for example `required apps`.
However, PopClip will treat `Required Apps`, `requiredApps`, `RequiredApps`,
`required_apps`, `required-apps` and `REQUIRED_APPS` as equivalents. It doesn't
matter which convention you use.

<!-- The full range of formats is as defined by
[case-anything](https://github.com/mesqueeb/case-anything), which PopClip uses
internally. -->

Additionally, older versions of PopClip used different names for some keys.
Where there is a new name, the old name is also still accepted. A table of old
and new names is given in [Key name mapping](#key-name-mapping).

:::

## Example

Before diving in to the details, let's look at an example config dictionary for
a published extension. This is based on the
[Yoink extension](https://github.com/pilotmoon/PopClip-Extensions/tree/master/source/Yoink.popclipext):

::: code-group

```json
{
  "identifier": "at.EternalStorms.Yoink.PopClipExtension",
  "popclipVersion": 3785,
  "name": "Yoink",
  "icon": "yoink.png",
  "app": {
    "name": "Yoink",
    "link": "https://eternalstorms.at/yoink/mac",
    "checkInstalled": true,
    "bundleIdentifiers": [
      "at.EternalStorms.Yoink",
      "at.EternalStorms.Yoink-setapp",
      "at.EternalStorms.Yoink-demo"
    ]
  },
  "serviceName": "Add Selected Text to Yoink",
  "captureHtml": true,
  "description": "Add the selected text to Yoink."
}
```

```yaml
identifier: at.EternalStorms.Yoink.PopClipExtension
popclip version: 3785
name: Yoink
icon: yoink.png
app:
  name: Yoink
  link: https://eternalstorms.at/yoink/mac
  check installed: true
  bundle identifiers:
    - at.EternalStorms.Yoink
    - at.EternalStorms.Yoink-setapp
    - at.EternalStorms.Yoink-demo
service name: Add Selected Text to Yoink
capture html: true
description: Add the selected text to Yoink.
```

:::

Not all of those fields are strictly needed. As we have already seen in
[Snippets](./snippets.md), we can also express a similar extension very
minimally, at the loss of some of the niceties that the fleshed-out version
provides:

::: code-group

```json
{
  "name": Yoink,
  "serviceName": Add Selected Text to Yoink
}
```

```yaml
name: Yoink
service name: Add Selected Text to Yoink
```

:::

::: tip Minimal or maximal?

In general, if you're writing an extension for your own use, you can freely omit
any fields that you don't need. But if you're preparing an extension for
publication, you should flesh out the config as much as possible, to provide the
best user experience for your extension.

:::

## Top level properties

The following keys are used at the top level of the config to define properties
of the extension itself. All properties are optional except `name`.

| Key               | Type                 | Description                                                                                                                                                                                                                                                      |
| ----------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name` (Required) | String (Localizable) | A short, human-readable display name for this extension.                                                                                                                                                                                                         |
| `icon`            | String               | See [Icons](#icons). If you omit this field, the icon for the first action will be used (if any), or else no icon will be displayed.                                                                                                                             |
| `identifier`      | String               | You may provide an string to uniquely identify this extension. See [The `identifier` field](#the-identifier-field).                                                                                                                                              |
| `description`     | String (Localizable) | A short, human readable description of this extension. Appears in the [directory](/extensions/) but not in the app.                                                                                                                                              |
| `macos version`   | String               | Minimum version number of Mac OS X needed by this extension. For example `10.8.2` or `11.0`.                                                                                                                                                                     |
| `popclip version` | Integer              | Minimum PopClip version required. This is the integer build number e.g. `4151`. Specifying the current PopClip version here can help preserve your extension's functionality in future, because PopClip applies backward-compatibility rules for old extensions. |
| `options`         | Array                | Array of dictionaries defining the options for this extension, if any. See [The `options` array](#the-options-array).                                                                                                                                            |
| `options title`   | String (Localizable) | Title to appear at the top of the options window. Default is `Options for <extension name>`.                                                                                                                                                                     |
| `entitlements`    | Array                | Only applies to JavaScript extensions. The possible values are `network` (allows use of XMLHttpRequest) and `dynamic` (allows dynamically generated actions).                                                                                                    |
| `actions`         | Array                | Array of dictionaries defining the actions for this extension. See [Action properties](#action-properties).                                                                                                                                                      |

### The `identifier` field

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

### The `options` array

Options are presented to the user in a preferences user interface window and are
saved in PopClip's preferences on behalf of the extension. Options appear in the
UI in the order they appear in the `options` array. An option dictionary has the
following structure.

| Key             | Type                 | Required?                    | Description                                                                                                                                                                                                                                                         |
| --------------- | -------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `identifier`    | String               | Required                     | Identifying string for this option. This is passed to your script. The identifier will be downcased or upcased for AppleScript and Shell Script targets, respectively — see [Script variables](./script-variables.md).                                              |
| `type`          | String               | Required                     | One of the following: `string` (text box for free text entry), `boolean` (a check box), `multiple` (pop-up box with multiple choice options), `heading` (not actually an option, but serves as a heading in the prefs window) or `password` (password entry field). |
| `label`         | String (Localizable) | Required                     | The label to appear in the UI for this option.                                                                                                                                                                                                                      |
| `description`   | String (Localizable) | Optional                     | A longer description to appear in the UI to explain this option.                                                                                                                                                                                                    |
| `default value` | String               | Optional                     | This field specifies the default value of the option. If omitted, `string` options default to the empty string, `boolean` options default to `true`, and `multiple` options default to the top item in the list. A `password` field may not have a default value.   |
| `values`        | Array                | Required for `multiple` type | Array of strings representing the possible values for the multiple choice option.                                                                                                                                                                                   |
| `value labels`  | Array                | Optional                     | Array of "human friendly" strings corresponding to the multiple choice values. This is used only in the PopClip options UI, and is not passed to the script. If omitted, the option values themselves are shown.                                                    |
| `inset`         | Boolean              | Optional                     | If true, the option field will be shown inset to the right of the label, instead of under it. Default is false.                                                                                                                                                     |
| `icon`          | String               | Optional                     | For `boolean` options only. Specify an icon to appear next to the check box.                                                                                                                                                                                        |

## Action properties

The following keys define properties of actions. All properties are optional.

| Key                  | Type                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`              | String (Localizable) | The title is displayed on the action button if there is no icon. For extensions with icons, the title is displayed in the tooltip. If omitted, the action will take the extension name as its title.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `icon`               | String               | The icon to show on the action button. See [Icons](#icons) for the icon specification format. If omitted, the action will take the extension icon as its icon. To explicitly specify no icon, set this field to `null`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `identifier`         | String               | A string to identify this action. In shell script and AppleScript actions, the identifier is passed to the script. The script can use this to find out which action was pressed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `regex`              | String               | A [Regular Expression](http://regularexpressions.info/) to be applied to the selected text. The action will appear only if the text matches the regex, and the matching part of the text is passed to the action. The regex engine used is Cocoa's `NSRegularExpression`, which uses the [ICU specification](https://unicode-org.github.io/icu/userguide/strings/regexp.html) for regular expressions. _Note: There is no need to use your own regex to match URLs, email addresses or file paths. Use one of the `requirements` keys `url`, `urls`, `email`, `emails` or `path` instead. Also be careful to avoid badly crafted regexes which never terminate against certain inputs._ |
| `requirements`       | Array                | Array consisting of zero or more of the strings listed in [the `requirements` array](#the-requirements-array). All the requirements in the array must be satisfied for the action to appear. If the field is omitted, `[text]` is used by default. To specify no requirements, supply an empty array: `[]`.                                                                                                                                                                                                                                                                                                                                                                             |
| `excluded apps`      | Array                | Array of bundle identifiers of applications. The action will not appear when PopClip is being used in any of the the specified apps.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `required apps`      | Array                | Array of bundle identifiers of applications. The action will only appear when PopClip is being used in one of the specified apps. _Note: This field does not make PopClip do a check to see if the app is present on the computer. For that, use the `app` field._                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `before`             | String               | String to indicate an action PopClip should take _before_ performing the main action. See [The `before` and `after` strings](#the-before-and-after-strings).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `after`              | String               | String to indicate an action PopClip should take _after_ performing the main action. See [The `before` and `after` strings](#the-before-and-after-strings).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `app` or `apps`      | Dictionary or Array  | Dictionary, or array of dictionaries, describing the app(s) or website(s) associated with this action. You can, optionally, specify that the app must be present on the system for the action to work. See [The `app` dictionary](#the-app-dictionary).                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `stay visible`       | Boolean              | If `true`, the PopClip popup will not disappear after the user clicks the action. (An example is the Formatting extension.) Default is `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `capture html`       | Boolean              | If `true`, PopClip will attempt to capture HTML and Markdown for the selection. PopClip makes its best attempt to extract HTML, first of all from the selection's HTML source itself, if available. Failing that, it will convert any RTF text to HTML. And failing that, it will generate an HTML version of the plain text. It will then generate Markdown from the final HTML. Default is `false`.                                                                                                                                                                                                                                                                                   |
| `restore pasteboard` | Boolean              | If true, then PopClip will restore the pasteboard to its previous contents after pasting text in the `paste-result` after-step. Default is `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Type-specific keys   | Varies               | See: [Shortcut actions](./shortcut-actions), [Service actions](./service-actions), [URL actions](./url-actions). [Key Press actions](./key-press-actions), [Shell Script actions](./shell-script-actions), [AppleScript actions](./applescript-actions), [JavaScript actions](./javascript-actions).                                                                                                                                                                                                                                                                                                                                                                                    |

### Action property placement

Action properties can be placed either in their own dictionaries in the
`actions` array, or at the top level. Properties set at the top level will apply
to all actions unless overridden in the individual action.

::: details Example

Consider this extension, which defines two actions:

```yaml
#popclip 
name: HTML Demo
actions:
- title: Action A
  icon: iconA.png
  capture html: true // [!code focus:2]
  after: show-result
  javascript: return "Hi from Action A - " + popclip.input.html
- title: Action B
  icon: iconB.png
  capture html: true // [!code focus:2]
  after: show-result
  javascript: return "Hi from Action B - " + popclip.input.html
```

Since the `capture html` and `after` properties are the same for both actions,
they can be placed at the top level:

```yaml
#popclip
name: HTML Demo
capture html: true // [!code focus:2]
after: show-result
actions:
- title: Action A
  icon: iconA.png
  javascript: return "Hi from Action A - " + popclip.input.html
- title: Action B
  icon: iconB.png
  javascript: return "Hi from Action B - " + popclip.input.html
```

:::

If the extension only needs to define a single action, you can place all the
action properties at the top level.

::: details Example

Consider this extension, which defines a single action:

```yaml
#popclip
name: Stickies
actions: 
- service name: Make Sticky
  capture html: true
```

Since there is only one action, the actions array can be eliminated, and all the
action properties can be placed at the top level:

```yaml
#popclip
name: Stickies
service name: Make Sticky
capture html: true
```

:::

<!-- ### Action that does nothing

If you want to define an action with no specific type, i.e. one that does
nothing, you can simply omit all the type-specific properties. However in this
case you must at least provide an empty `action` dictionary, as follows:

```yaml
#popclip
name: Do Nothing
action: {}
```

An action that does nothing will appear greyed out in the PopClip bar. Finding a
use for this is left as an exercise for the reader. -->

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

::: info Note on side effect of `requirements` field

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

:::

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

The `app` field is a dictionary with the following structure:

| Key                  | Type    | Required?                               | Description                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------- | ------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`               | String  | Required                                | Name of the app or website that this extension interacts with. For example `Evernote`.                                                                                                                                                                                                                                                                                      |
| `link`               | String  | Required                                | Link to the website or app home page where the user can obtain the app. For example `https://evernote.com/`.                                                                                                                                                                                                                                                                |
| `check installed`    | Boolean | Optional                                | If `true`, PopClip will check whether an app with one of the given `bundle identifiers` is installed when the user tries to use the extension. If none is found, PopClip will show a message and a link to the website given in `link`. Default is `false`.                                                                                                                 |
| `bundle identifiers` | Array   | Required if `check installed` is `true` | Array of bundle identifiers for this app, including all application variants that work with this extension. In the simplest case there may be just one bundle ID. An app may have alternative bundle IDs for free/pro variants, an App Store version, a standalone version, a Setapp version, and so on. Include all the possible bundle IDs that the user might encounter. |

To specify multiple apps, use the `apps` field instead, supplying an array of
dictionaries.

## Notes

### Localized strings

Fields shown as "String (Localizable)" type may be either a string or a
dictionary. If you supply a string, that string is always used. Alternatively,
you can supply a dictionary mapping language codes to strings, and PopClip will
display the string for the user's preferred language if possible, with fallback
to the `en` string, which is always required.

The following language codes are supported:

::: details Language codes table

| Language Code | Language Name         |
| ------------- | --------------------- |
| `en`          | English               |
| `en-gb`       | English (UK)          |
| `da`          | Danish                |
| `de`          | German                |
| `es`          | Spanish               |
| `fr`          | French                |
| `it`          | Italian               |
| `ja`          | Japanese              |
| `ko`          | Korean                |
| `nl`          | Dutch                 |
| `pl`          | Polish                |
| `pt-br`       | Portuguese (BR)       |
| `ru`          | Russian               |
| `sk`          | Slovak                |
| `tr`          | Turkish               |
| `vi`          | Vietnamese            |
| `zh-hans`     | Chinese (Simplified)  |
| `zh-hant`     | Chinese (Traditional) |

:::

::: info Example of localized string

```yaml
name: 
  en: My Extension
  fr: Mon Extension
  zh-hans: 我的扩展
```

:::

### Null values in Plist

Plist does not have a native way to represent the `null` value of JSON and YAML.
Use `<false />` in a Plist where you would use `null` in JSON or YAML.

### Key name mapping

Some field names were different in older versions of PopClip. Others have
alternative allowable spellings.

To preserve backwards compatibility, key names in the config are transformed as
follows:

1. First, the naming convention is standardized to lowercase with spaces. For
   example, `RequiredApps` becomes `required apps`.

2. Then, if the field name has the prefix `extension` or `option` (which were
   expected by older versions of PopClip), it is removed.

3. Finally, PopClip applies the following mapping:

::: details Key name mapping table

| Old/Alternative name      | Canonical name   |
| ------------------------- | ---------------- |
| apple script              | applescript      |
| apple script call         | applescript call |
| apple script file         | applescript file |
| blocked apps              | excluded apps    |
| image file                | icon             |
| java script               | javascript       |
| java script file          | javascript file  |
| js                        | javascript       |
| lang                      | language         |
| mac os version            | macos version    |
| params                    | parameters       |
| pass html                 | capture html     |
| pop clip version          | popclip version  |
| preserve image color      | preserve color   |
| regular expression        | regex            |
| required os version       | macos version    |
| required software version | popclip version  |
| script interpreter        | interpreter      |

:::

::: info Example

An old extension uses the key `Extension Image File` to define its icon. PopClip
will first standardize the case to `extension image file`. Then it will remove
the `extension` prefix, leaving `image file`. Then it will map this to `icon`.

:::
