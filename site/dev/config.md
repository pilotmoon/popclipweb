---
outline: deep
titleTemplate: :title — PopClip Developer
---

# The config dictionary

Every extension is defined by a config dictionary. This can be provided either
by a [snippet](./snippets) or a [package](./packages), but in each case the
underlying structure is the same.

::: tip Key names

PopClip is very flexible about how you name keys. In this documentation you'll
mostly see keys named in lowercase with spaces, for example `key name`.
However, PopClip will treat `Key Name`, `keyName`, `KeyName`,
`key_name`, `key-name` and `KEY_NAME` as equivalents.

<!-- The full range of formats is as defined by
[case-anything](https://github.com/mesqueeb/case-anything), which PopClip uses
internally. -->

I tend to use `key name` in YAML, and `keyName` in JSON, but you can use
whatever you prefer.

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
  "name": "Yoink",
  "serviceName": "Add Selected Text to Yoink"
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
| `icon`            | String               | See [Icons](./icons). If you omit this field, the icon for the first action will be used (if any), or else no icon will be displayed.                                                                                                                             |
| `identifier`      | String               | You may provide a string to uniquely identify this extension. See [The `identifier` field](#the-identifier-field).                                                                                                                                              |
| `description`     | String (Localizable) | A short, human readable description of this extension. Appears in the [directory](/extensions/) but not in the app.                                                                                                                                              |
| `macos version`   | String               | Minimum version number of Mac OS X needed by this extension. For example `10.8.2` or `11.0`.                                                                                                                                                                     |
| `popclip version` | Integer              | Minimum PopClip version required. This is the integer build number e.g. `4151`. Specifying the current PopClip version here can help preserve your extension's functionality in future, because PopClip applies backward-compatibility rules for old extensions. |
| `options`         | Array                | Array of dictionaries defining the options for this extension, if any. See [The `options` array](#the-options-array).                                                                                                                                            |
| `options title`   | String (Localizable) | Title to appear at the top of the options window. Default is `Options for <extension name>`.                                                                                                                                                                     |
| `entitlements`    | Array                | Only applies to JavaScript extensions. The possible values are `network` (allows use of XMLHttpRequest) and `dynamic` (allows dynamically generated actions).                                                                                                    |
| `action` or `actions`         | Dictionary or Array            |   A dictionary or array of dictionaries defining the action(s) for this extension. See [Actions](./actions).                                                                                                                                                      |

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

## Config notes

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
