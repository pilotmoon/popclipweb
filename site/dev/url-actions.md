---
outline: deep
titleTemplate: :title — PopClip Developer
---

# URL actions

In a URL action, PopClip will ask macOS to open a given URL, optionally inserting the selected text and option parameters into the URL.

If the URL scheme is `http:` or `https:` then:

- if the current app is not [known browser](/kb/browsers), PopClip will ask macOS to open the URL in the default web browser;
- if the current app is a known browser, PopClip will ask the current app to open the URL.

For all other URL schemes, PopClip will ask macOS to open the URL in the default app for that scheme.

## Properties

A URL action is defined by the presence of a `url` field, as follows:

|Key|Type|Description|
|---|----|-----------|
|`url`|String|The URL to open when the user clicks the action. Use `{popclip text}` as placeholder for the selected text. |

::: tip Shorthand form
You can substitute `***` as a shorthand for `{popclip text}`.
:::

## Input and output

The selected plain text will be inserted into the URL, replacing the `{popclip text}` placeholder if present. The inserted string will be automatically URL-encoded by PopClip.

Option parameters can be inserted in the URL, in the same format as for AppleScript actions. See [example](#use-of-option-parameter).

URL actions never return any output.

## Examples

### Simple web search

The following snippet defines an extension with a single URL action that opens a search for the selected text on the movie review site, Rotten Tomatoes:

```yaml
#popclip extension to search Rotten Tomatoes
name: Rotten Tomatoes
icon: iconify:simple-icons:rottentomatoes
url: https://www.rottentomatoes.com/search?search=***
```

### Custom URL scheme

The following snippet opens a custom URL scheme, in this case `maps:` for Apple Maps:

```yaml
#popclip custom URL scheme example, Apple Maps
name: Maps
icon: iconify:material-symbols:map-outline
url: maps://?q={popclip text}
```

### Use of option parameter

The following snippet opens a Wiktionary search page, with the site domain specified as an option parameter:

::: code-group

```yaml
#popclip Wiktionary search with subdomain option
name: Wiktionary
icon: iconify:ooui:logo-wiktionary
url: https://{popclip option subdomain}.wiktionary.org/wiki/{popclip text}
options:
- type: string
  identifier: subdomain
  label: Site subdomain
  defaultValue: en
```

```json
#popclip Wiktionary search with subdomain option
{
  "name": "Wiktionary",
  "icon": "iconify:ooui:logo-wiktionary",
  "url": "https://{popclip option subdomain}.wiktionary.org/wiki/{popclip text}",
  "options": [
    {
      "type": "string",
      "identifier": "subdomain",
      "label": "Site subdomain",
      "defaultValue": "en"
    }
  ]
}
```

:::