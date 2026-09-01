---
outline: deep
titleTemplate: :title — PopClip Developer
---

# Config format

Every extension is defined by a configuration dictionary. This can be provided either
by a [snippet](./snippets) or a [package](./packages), but in each case the
underlying structure is the same.

This page describes the format itself — how keys are named and how values are
interpreted. The properties themselves are documented on the
[Top-level properties](./top-level-properties), [Action properties](./actions)
and [Options](./options) pages.

## Key naming

PopClip is very flexible about how you name keys. In this documentation you'll
mostly see keys named in lowercase with spaces, for example `key name`. However,
PopClip will treat `Key Name`, `keyName`, `KeyName`, `key_name`, `key-name` and
`KEY_NAME` as equivalents.

<!-- The full range of formats is as defined by
[case-anything](https://github.com/mesqueeb/case-anything), which PopClip uses
internally. -->

I tend to use `key name` in YAML, and `keyName` in JSON, but you can use
whatever you prefer.

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

## Localized strings

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

## Null values in Plist

Plist does not have a native way to represent the `null` value of JSON and YAML.
Use `<false />` in a Plist where you would use `null` in JSON or YAML.

## Key name mapping

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

| Alternative name          | Canonical name   |
| ------------------------- | ---------------- |
| apple script              | applescript      |
| apple script call         | applescript call |
| apple script file         | applescript file |
| blocked apps              | excluded apps    |
| flip horizontal           | flip x           |
| flip vertical             | flip y           |
| id                        | identifier       |
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
