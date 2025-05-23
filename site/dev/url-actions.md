---
outline: deep
titleTemplate: :title — PopClip Developer
---

# Open URL actions

In an Open URL action, PopClip will ask macOS to open a URL generated from a template that you provide.

If the URL scheme is `http:` or `https:` and the current app is a [known browser](/kb/browsers), PopClip will ask
the current app to open the URL.

In all other cases, PopClip will ask macOS to open the URL in the default app app for its URL scheme.

## Properties

An Open URL action is defined by the presence of a `url` field, plus additional
optional fields, as follows:

| Key             | Type               | Description                                                                                                                                                        |
| --------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `url`           | String             | The URL to open when the user clicks the action. Use either `{popclip text}` or `***` as placeholder for the selected text.                                        |
| `alternate url` | String (Optional)  | An alternate URL to open if the user holds Option (⌥) when invoking the action. Same format as `url`.                                                              |
| `clean query`   | Boolean (Optional) | If `true`, newlines and tabs in the text will be replaced with a space, and consecutive spaces will be collapsed to a single space. Default is `false`.            |

## Input and output

The selected plain text will be inserted into the URL, replacing the
`{popclip text}` or `***` placeholder if present. PopClip will always trim leading and
trailing whitespace and newlines, and URL-encode the text. Optionally, PopClip
will perform further whitespace cleanup with the `clean query` flag.

Option parameters can be inserted in the URL, in the same format as for
AppleScript actions. See [example](#use-of-option-parameter).

URL actions never return any output.

::: tip Advanced behaviours

If you need to customize the generation of the URL string or specify a particular app to open the URL, don't use an Open URL action. Instead, use an AppleScript action and the `popclip.openUrl()` function.

:::

## Examples

### Simple web search

The following snippet defines an extension with a single URL action that opens a
search for the selected text on the movie review site, Rotten Tomatoes:

```yaml
#popclip extension to search Rotten Tomatoes
name: Rotten Tomatoes
icon: iconify:simple-icons:rottentomatoes
url: https://www.rottentomatoes.com/search?search=***
```

### Custom URL scheme

The following snippet opens a custom URL scheme, in this case `maps:` for Apple
Maps:

```yaml
#popclip custom URL scheme example, Apple Maps
name: Maps
icon: iconify:material-symbols:map-outline
url: maps://?q={popclip text}
```

### Use of option parameter

The following snippet opens a Wiktionary search page, with the site domain
specified as an option parameter:

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
