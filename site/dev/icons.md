---
titleTemplate: :title — PopClip Developer
---

<script setup>
import IconExplorer from '/src/IconExplorer.vue';
</script>

# Icons

Icons may be specified in `icon` fields in several different ways:

- As a filename: `<filename>.png` or `<filename>.svg`. See
  [Image files](#image-files).

- As text: `<text specifier>`. See [Text icons](#text-icons).

- As an Iconify icon: `iconify:<icon set prefix>:<icon name>`. See
  [Iconify icons](#iconify-icons).

- As an SF Symbol: `symbol:<symbol name>`. See
  [SF Symbols icons](#sf-symbols-icons).

- As SVG source code: `svg:<svg source>`.

## Image files

If you specify the name of a PNG or SVG image file in the extension's package,
it will be used.

Images should feature a monochrome shape on a transparent background. Variable
opacity can be used for shading.

PNG icons should be at least 256 pixels high.

## Text icons

Using a particular format, you can instruct PopClip to generate a text-based
icon. Text icons can have a `text:` prefix, but it is optional.

### Text icon examples

| Specifier string              | Icon generated                                                                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text:A` or just `A`          | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/A.png" width="20" height="20">                           |
| `circle 1`                    | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/circle_1.png" width="20" height="20">                    |
| `circle filled 本`            | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/circle_filled_本.png" width="20" height="20">            |
| `square xyz`                  | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/square_xyz.png" width="20" height="20">                  |
| `square filled !`             | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/square_filled_!.png" width="20" height="20">             |
| `square filled monospaced ()` | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/square_filled_monospaced_().png" width="20" height="20"> |
| `search E`                    | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/search_E.png" width="20" height="20">                    |
| `search filled monospaced £`  | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/search_filled_monospaced_£.png" width="20" height="20">  |

### Text icon format

The specifier format is `<shape> <modifiers> <text>`.

- `<shape>` is optional and can be one of:

| Keyword  | Effect                                     |
| -------- | ------------------------------------------ |
| `square` | Encloses text in a round-cornered square.  |
| `circle` | Encloses text in a circle.                 |
| `search` | Encloses text in a magnifying glass shape. |

- `<modifiers>` are optional and can be any combination of:

| Keyword      | Effect                                                      |
| ------------ | ----------------------------------------------------------- |
| `filled`     | Specifies a solid filled shape instead of an outline shape. |
| `monospaced` | Specifies that the text be drawn with a monospaced font.    |

- `<text>` can be up to three characters.

::: info :bulb: Tip: Monospaced font

Punctuation symbols often look better in icons when drawn with the `monospaced`
modifier.

:::

## Iconify icons

[Iconify](https://iconify.design/) provides over 150,000 icons from a variety of
open-source icon sets. Browse the catalog at
<https://icon-sets.iconify.design/>.

The format is `iconify:<icon set prefix>:<icon name>`.

### Iconify icon examples

| Specifier string               | Icon generated |
| ------------------------------ | -------------- |
| `iconify:ion:fish`             | TODO           |
| `iconify:solar:flag-bold`      | TODO           |
| `iconify:noto:cowboy-hat-face` | TODO           |

## SF Symbols icons

Apple [SF Symbols](https://developer.apple.com/sf-symbols/) are available on
macOS 11.0 and above. The icon catalog can be viewed by installing Apple's SF
Symbols app on your Mac.

The format is `symbol:<symbol name>`.

### SF Symbols icon examples

| Specifier string        | Icon generated                                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `symbol:flame`          | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/symbol-flame.png" width="20" height="20">          |
| `symbol:hand.raised`    | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/symbol-hand.raised.png" width="20" height="20">    |
| `symbol:signpost.right` | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/symbol-signpost.right.png" width="20" height="20"> |

## Color handling

By default, PopClip treats icons as a mask images and renders them with a
uniform fill color, ignoring any color information in the image. However, you
can set the `preserve color` flag (see [Icon options](#icon-options)) to tell
PopClip to keep the original color palette.

::: info Special case: Emoji and Iconify icons

PopClip gives special treatment to emoji icons and color icons from Iconify.
These icons are inherently colored, and PopClip will preserve their color even
if `preserve color` is not set.

:::

## Icon options

These optional fields can be placed in the config alongside the `icon` field to
modify how PopClip draws it.

| Key               | Type    | Description                                                                                                                                |
| ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `preserve color`  | Boolean | If `true`, the supplied icon will be displayed with its original color instead of being filled in white/black. Default is `false`.         |
| `preserve aspect` | Boolean | If `true`, the supplied icon will be displayed with its original aspect ratio instead of being scaled to fit a square. Default is `false`. |
| `flip horizontal` | Boolean | If `true`, the supplied icon will be drawn horizontally flipped. Default is `false`.                                                       |
| `flip vertical`   | Boolean | If `true`, the supplied icon will be drawn vertically flipped. Default is `false`.                                                         |

## Icon Preview tool

![](./media/anim-icon-preview-2.mp4 "The Icon Preview extension.")

As a handy tool, the following snippet defines an extension that will display
the icon for any text string you select. (To see how to install this, see
[Snippets](./snippets).)

```javascript
// #popclip
// name: Icon Preview
// entitlements: [dynamic]
// language: javascript
// module: true
exports.actions = (selection) => {
  return [{
    icon: selection.text,
  }];
};
```
