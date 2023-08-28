# Icons

Icons may be specified in the `icon` fields in a few different ways:

- **As a filename:** `<filename>.png` or `<filename>.svg` specifies an image
  file within the extension package, in either PNG or SVG format. PNG icons
  should be at least 256 pixels high.

- **As a text-based icon:** Using a special format, you can instruct PopClip to
  generate a text-based icon (see below).

- **As an Iconify icon:** `iconify:<iconify identifier>`. For example
  `iconify:ion:fish`. Iconify provides over 100,000 open source icons. Search
  for icons at: <https://icon-sets.iconify.design/>. PopClip needs internet
  access to retrieve the icon.

- **As an SF Symbol:** `symbol:<symbol name>` specifies an Apple
  [SF Symbols](https://sfsymbols.com) identifier, for example `symbol:flame`.
  Symbols are only available on macOS 11.0 and above.

- **As SVG source code:** `svg:<svg source>`.

## Color handling

Images suitable for use as icons will typically be solid black on a transparent
background. Opacity can be used for shading.

By default, PopClip renders icons all in the same color, ignoring any color
information in the image. However, you can set the `preserve color` flag in
`icon options` to tell PopClip to keep the original color palette. (Color icons
from Iconify will automatically be rendered in color.)

## Text-based icons

Text-based icons can up to three characters, on their own or within an enclosing
shape. They are specified by space-separated keywords followed by the characters
to draw.

The following keywords define an enclosing shape (only one of these should be
included):

| Keyword  | Effect                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------ |
| `text`   | Draw the text on its own, without a shape. This is the default if no shape keyword is specified. |
| `square` | Encloses text in a round-cornered square.                                                        |
| `circle` | Encloses text in a circle.                                                                       |
| `search` | Encloses text in a magnifying glass shape.                                                       |

The following keywords modify the way the text is drawn:

| Keyword      | Effect                                                                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `filled`     | Specifies a solid filled shape (default is an outline shape).                                                                                            |
| `monospaced` | Specifies that the text be drawn in a monospaced font (default is variable-width font). Punctuation characters often render better in a monospaced font. |

## Examples of icon specifiers

| Text String                   | Icon Generated                                                                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `symbol:flame`                | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/symbol-flame.png" width="20" height="20">                |
| `symbol:hand.raised`          | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/symbol-hand.raised.png" width="20" height="20">          |
| `symbol:signpost.right`       | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/symbol-signpost.right.png" width="20" height="20">       |
| `A` or `text A`               | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/A.png" width="20" height="20">                           |
| `circle 1`                    | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/circle_1.png" width="20" height="20">                    |
| `circle filled 本`            | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/circle_filled_本.png" width="20" height="20">            |
| `square xyz`                  | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/square_xyz.png" width="20" height="20">                  |
| `square filled !`             | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/square_filled_!.png" width="20" height="20">             |
| `square filled monospaced ()` | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/square_filled_monospaced_().png" width="20" height="20"> |
| `search E`                    | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/search_E.png" width="20" height="20">                    |
| `search filled monospaced £`  | <img src="https://raw.githubusercontent.com/pilotmoon/PopClip-Extensions/master/docs-assets/texticons/search_filled_monospaced_£.png" width="20" height="20">  |

As a handy tool, the following snippet defines an extension that will display
the icon for any text string you select.

```javascript
// #popclip
// name: Icon Preview
// entitlements: [dynamic]
// language: javascript
// module: true
exports.actions = (selection) => {
  return {
    icon: selection.text,
  };
};
```

![](./media/anim-icon-preview-2.mp4 "The Icon Preview extension.")

## Icon options

These icon options can be placed in the config alongside the `icon` field to
modify the way the icon is drawn.

| Key               | Type    | Required?                                                                                                                                | Description |
| ----------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `preserve color`  | Boolean | If true, the supplied icon will be displayed with its original color instead of being filled in white/black. Default is `false`.         |             |
| `preserve aspect` | Boolean | If true, the supplied icon will be displayed with its original aspect ratio instead of being scaled to fit a square. Default is `false`. |             |
| `flip horizontal` | Boolean | If true, the supplied icon will be drawn horizontally flipped. Default is `false`.                                                       |             |
| `flip vertical`   | Boolean | If true, the supplied icon will be drawn vertically flipped. Default is `false`.                                                         |             |
