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

## Formats

PopClip supports 3 config formats: [YAML](#yaml), [JSON](#json) and [plist](#plist).

**The recommended format is YAML**. It is the
most versatile: it works as a standalone config file in a package
(`Config.yaml`), as a [config snippet](./snippets#config-snippets), and as
the comment header of a [code snippet](./snippets#inverted-syntax) or
[module](./js-modules) file. The examples in this documentation are YAML.

[JSON](#json) and [plist](#plist) are also supported for package config
files.

## Example

Let's look at an example `Config.yaml` for
a published extension. This is based on the
[Yoink extension](https://github.com/pilotmoon/PopClip-Extensions/tree/master/source/Yoink.popclipext):

```yaml
identifier: at.EternalStorms.Yoink.PopClipExtension
popclipVersion: 3785
name: Yoink
icon: yoink.png
app:
  name: Yoink
  link: https://eternalstorms.at/yoink/mac
  checkInstalled: true
  bundleIdentifiers:
    - at.EternalStorms.Yoink
    - at.EternalStorms.Yoink-setapp
    - at.EternalStorms.Yoink-demo
serviceName: Add Selected Text to Yoink
captureHtml: true
description: Add the selected text to Yoink.
```

Not all of those fields are strictly needed. As we have already seen in
[Snippets](./snippets.md), we can also express a similar extension very
minimally, at the loss of some of the niceties that the fleshed-out version
provides:

```yaml
name: Yoink
serviceName: Add Selected Text to Yoink
```

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

## Format details

### YAML

PopClip's YAML parser expects [YAML 1.2](https://yaml.org). A package config
file written in YAML should be named `Config.yaml`. Example:

```yaml
name: Yoink
serviceName: Add Selected Text to Yoink
```

### JSON

A package config file may be written in
[JSON](https://www.json.org/json-en.html), named `Config.json`. Example:

```json
{
  "name": "Yoink",
  "serviceName": "Add Selected Text to Yoink"
}
```

### Plist

Plist was the original config format for PopClip extensions. It is Apple's own
[XML Property List](https://en.wikipedia.org/wiki/Property_list) format, and
many of the older extensions in the
[PopClip-Extensions repo](https://github.com/pilotmoon/PopClip-Extensions)
still use it, named `Config.plist`. It remains fully supported, but it is a
legacy format — verbose, and harder to read and edit than YAML — and I don't
recommend it for new extensions.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Name</key>
  <string>Yoink</string>
  <key>Service Name</key>
  <string>Add Selected Text to Yoink</string>
</dict>
</plist>
```

One plist quirk to know about: plist has no native way to represent the
`null` value of JSON and YAML. Use `<false />` in a plist where these docs call for
`null`.

## Compatibility

To preserve compatibility with old extension formats,
PopClip allows properties in config files to be named in different ways.

### Key naming

PopClip is very flexible about how you name keys. These docs name every key in
camelCase, for example `keyName` — but PopClip treats `key name`, `Key Name`,
`KeyName`, `key_name`, `key-name` and `KEY_NAME` as equivalents, so configs
written in any of those styles work identically.

<!-- The full range of formats is as defined by
[case-anything](https://github.com/mesqueeb/case-anything), which PopClip uses
internally. -->

### Key name mapping

Some field names were different in older versions of PopClip. Others have
alternative allowable spellings.

To preserve backwards compatibility, key names in the config (all formats) are transformed as
follows:

1. First, the naming convention is standardized to lowercase with spaces. For
   example, `RequiredApps` becomes `required apps`.

2. Then, if the first word is `extension` or `option` (which were
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
the word `extension`, leaving `image file`. Then it will map this to `icon`.

:::
