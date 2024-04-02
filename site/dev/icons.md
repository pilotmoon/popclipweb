---
titleTemplate: :title — PopClip Developer
outline: deep
---

<script setup>
import Icon from '/src/Icon.vue';
import InlineIcon from '/src/InlineIcon.vue';
import IconExplorer from '/src/IconExplorer.vue';
</script>

<style module>
table img {
  height: 48px;
}
</style>

# Icons

Icons are specified by using a text string to describe an icon.

<IconExplorer />

An icon specifier string describes an icon using a simple text-based format. The
string consists of a series of space-separated keywords, with the final keyword
specifying the **base icon** (see [Base icon formats](#base-icon-formats)), and
the preceding keywords (if any) specifying **modifiers** (see
[Icon modifiers](#icon-modifiers)).

Here are some examples:

| Specifier string                 | Icon generated                                 | Notes                                                                                                         |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `T`                              | <Icon spec="T" />                              | Here, `T` specifies the base icon as a [text icon](#text-icons).                                              |
| `square T`                       | <Icon spec="square T" />                       | Here, `square` is a modifier that encloses the base icon in a square.                                         |
| `square filled T`                | <Icon spec="square filled T" />                | Combining two modifiers; `filled` specifies that the square is a solid shape.                                 |
| `circle filled T`                | <Icon spec="circle filled T" />                | Here we use a non-Ascii character as the base icon. The `circle` modifier encloses the base icon in a circle. |
| `search filled T`                | <Icon spec="search filled T" />                | The `search` modifier encloses the base icon in a magnifying glass shape.                                     |
| `iconify:mdi:home`               | <Icon spec="iconify:mdi:home" />               | Here, the base icon is an [Iconify icon](#iconify-icons).                                                     |
| `square filled iconify:mdi:home` | <Icon spec="square filled iconify:mdi:home" /> | We put the home icon in a filled square.                                                                      |
| `strike iconify:mdi:home`        | <Icon spec="strike iconify:mdi:home" />        | The `strike` modifier draws a strike-through line over the base icon.                                         |
| `symbol:hand.raised`             | <Icon spec="symbol:hand.raised" />             | Here, the base icon as an [SF Symbols icon](#sf-symbols-icons).                                               |
| `flip-x symbol:hand.raised`      | <Icon spec="flip_x symbol:hand.raised" />      | The `flip-x` modifier flips the base icon horizontally.                                                       |

## Base icon formats

### File icons

[Packaged extensions](/dev/packages) can contain image files for use as icons.
File icons are specified with a path to the image file relative to the package
root directory.

```json
{
  "icon": "icon.png"
}
```

Images must be in either PNG or SVG format. A good icon will feature a
monochrome shape on a transparent background. Variable opacity can be used for
shading. PNG icons should be at least 256 pixels high.

When used with modifiers, the file path must be prefixed with `file:`.

```json
{
  "icon": "square filled file:icon.png"
}
```

### Text icons

Text icons can include up to 3 characters and are specified simply as the text
itself.

Text icons are drawn using the system font. Adding the `monospaced` modifier
will draw the icon in a monospaced variant.

If the text icon is a single emoji without modifiers, it rendered in color.

Examples:

| Specifier string | Icon generated                |
| ---------------- | ----------------------------- |
| `ABC`            | <Icon spec="ABC" />           |
| `@`              | <Icon spec="@" />             |
| `本`             | <Icon spec="本" />            |
| `()`             | <Icon spec="()" />            |
| `monospaced ()`  | <Icon spec="monospaced ()" /> |
| `😵‍💫`           | <Icon spec="😵‍💫" />          |

::: info :bulb: Tip: Monospaced font

Punctuation symbols often look better in icons when drawn with the `monospaced`
modifier.

:::

### Iconify icons

[Iconify](https://iconify.design/) provides access to over 200,000 icons from a
variety of open-source icon sets, using a unified naming system.

The Iconify website provides a [catalog](https://icon-sets.iconify.design/) of
available icons.

The format is `iconify:<icon set prefix>:<icon name>`.

Some Iconify icons contain color information. These are automatically recognized
by PopClip and will be rendered in color.

Examples:

| Specifier string             | Icon generated                             |
| ---------------------------- | ------------------------------------------ |
| `iconify:ion:fish`           | <Icon spec="iconify:ion:fish" />           |
| `iconify:solar:flag-bold`    | <Icon spec="iconify:solar:flag-bold" />    |
| `iconify:logos:spotify-icon` | <Icon spec="iconify:logos:spotify-icon" /> |

### SF Symbols icons

Apple [SF Symbols](https://developer.apple.com/sf-symbols/) are available on
macOS 11.0 and above. (Symbol availability may vary by macOS version). The icon
catalog can be viewed by installing Apple's SF Symbols app on your Mac.

The format is `symbol:<symbol name>`.

Symbols are always drawn in the monochrome variant.

Examples:

| Specifier string        | Icon generated                               |
| ----------------------- | -------------------------------------------- |
| `symbol:flame`          | <Icon spec="symbol:flame" />                 |
| `symbol:hand.raised`    | <Icon spec="symbol:hand.raised" />           |
| `symbol:signpost.right` | <Icon spec="rotate symbol:signpost.right" /> |

### SVG Icons

You can supply the raw SVG for the icon in the icon field itself.

The format is `svg:<svg string>`.

::: details Example

`svg:<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="m6 10.95l-1.875 1.025l-2.975-5.2L7.75 3H10v1q0 .825.588 1.413T12 6q.825 0 1.413-.587T14 4V3h2.25l6.6 3.775l-2.95 5.15l-1.9-.95V21H6z"/></svg>`

generates:

<Icon style="height: 48px" spec="svg:<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'><path fill='currentColor' d='m6 10.95l-1.875 1.025l-2.975-5.2L7.75 3H10v1q0 .825.588 1.413T12 6q.825 0 1.413-.587T14 4V3h2.25l6.6 3.775l-2.95 5.15l-1.9-.95V21H6z'/></svg>" />

:::

<!-- ### Data icons

You can supply the raw data for the icon in the icon field itself as a
[data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs).

The format is: `data:<mediatype>[;base64],<data>`, where `<mediatype>` may be
either `image/svg+xml` or `image/png`.

::: details SVG Example

Specifier string:

`data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M5.5%2015v-4.5H4V9h3v6H5.5ZM9%2015v-2.5q0-.425.288-.713T10%2011.5h2v-1H9V9h3.5q.425%200%20.713.288T13.5%2010v1.5q0%20.425-.288.713t-.712.287h-2v1h3V15H9Zm6%200v-1.5h3v-1h-2v-1h2v-1h-3V9h3.5q.425%200%20.713.288T19.5%2010v4q0%20.425-.288.713T18.5%2015H15Z%22%2F%3E%3C%2Fsvg%3E"/></svg>`

generates:

<Icon style="height: 48px" spec="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M5.5%2015v-4.5H4V9h3v6H5.5ZM9%2015v-2.5q0-.425.288-.713T10%2011.5h2v-1H9V9h3.5q.425%200%20.713.288T13.5%2010v1.5q0%20.425-.288.713t-.712.287h-2v1h3V15H9Zm6%200v-1.5h3v-1h-2v-1h2v-1h-3V9h3.5q.425%200%20.713.288T19.5%2010v4q0%20.425-.288.713T18.5%2015H15Z%22%2F%3E%3C%2Fsvg%3E" />

:::

::: details PNG Example

Specifier string:

`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEABAMAAACuXLVVAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAAFiUAABYlAUlSJPAAAAAwUExURUdwTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACVM9DkAAAAPdFJOUwDcIDTLUFYGEqLpZfaDQdxVBh4AAAIbSURBVHja7doxS0JRGMZxuVI6BUG4GBhtDoHQkmPQViSBtAsVjS66CNIuLrWF0CcIaalojsAhXEMaGoJwvOCiCbfR9w5dXI6P4v/3Be4D5/C87xFjMQAAAAAAAAAAAAAAAAAAAADAIknsTmvPTYD4/vqUUmUnASrBtH6vCEAAAhCAAARY9gBv6nF87WYhqR9E2DTfH/y4CeCdRrg1AdJurkD0utaafH/8IVhYd9qTAMOt2X8/+WBO4Lg8+wCVwuT7/rPgBPrdSYB3wRX0eu5LIFIz474EIt9sZ+ISWLsTl0C2Ky6BnrgEquoS+A60JWDnkKYE2uISsHMoJTiBekFcAnlxCXjqEmiYOeRfCq5gcdlLwC6jr4ISCC2jKcEVrMxTCQwUJWCv4KHgBOwyOhKcQGgZ7eQEy2jB1rB4GR08iZfRe0EN12wJ3IiX0cGXeA4pSsDOIUUJhOZQR1DDdXUJ5MUl4KlLwC6jY8EullBfwZWC+Dlgr6C/jFewJr6CsWKg/U0gNIfSijnUFc+hF3EJrKpLoK8ugZa4BOzvcpISKIlLwDsSl0BTXAKJkrgE4uoSyIpLIPkpLoGquAQS9kWq+GHQYxOYoxfpWPIcCMSbgLoEGuoSOBGXQGgODR8v/nXu6HTsHArGEX/t3si5L4FIIzcBKhlxgGYgDpAlAAEIQAACEGBxAviOFpLtqQleDAAAAAAAAAAAAMCi+gOiz1VAs+KXUwAAAABJRU5ErkJggg==`

generates:

<Icon style="height: 48px" spec="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEABAMAAACuXLVVAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAAFiUAABYlAUlSJPAAAAAwUExURUdwTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACVM9DkAAAAPdFJOUwDcIDTLUFYGEqLpZfaDQdxVBh4AAAIbSURBVHja7doxS0JRGMZxuVI6BUG4GBhtDoHQkmPQViSBtAsVjS66CNIuLrWF0CcIaalojsAhXEMaGoJwvOCiCbfR9w5dXI6P4v/3Be4D5/C87xFjMQAAAAAAAAAAAAAAAAAAAADAIknsTmvPTYD4/vqUUmUnASrBtH6vCEAAAhCAAARY9gBv6nF87WYhqR9E2DTfH/y4CeCdRrg1AdJurkD0utaafH/8IVhYd9qTAMOt2X8/+WBO4Lg8+wCVwuT7/rPgBPrdSYB3wRX0eu5LIFIz474EIt9sZ+ISWLsTl0C2Ky6BnrgEquoS+A60JWDnkKYE2uISsHMoJTiBekFcAnlxCXjqEmiYOeRfCq5gcdlLwC6jr4ISCC2jKcEVrMxTCQwUJWCv4KHgBOwyOhKcQGgZ7eQEy2jB1rB4GR08iZfRe0EN12wJ3IiX0cGXeA4pSsDOIUUJhOZQR1DDdXUJ5MUl4KlLwC6jY8EullBfwZWC+Dlgr6C/jFewJr6CsWKg/U0gNIfSijnUFc+hF3EJrKpLoK8ugZa4BOzvcpISKIlLwDsSl0BTXAKJkrgE4uoSyIpLIPkpLoGquAQS9kWq+GHQYxOYoxfpWPIcCMSbgLoEGuoSOBGXQGgODR8v/nXu6HTsHArGEX/t3si5L4FIIzcBKhlxgGYgDpAlAAEIQAACEGBxAviOFpLtqQleDAAAAAAAAAAAAMCi+gOiz1VAs+KXUwAAAABJRU5ErkJggg==" />

::: -->

## Icon modifiers

The following modifiers can be prefixed to the specifier string to alter how the
icon is drawn.

### Style modifiers

| Keyword      | Description                                                 |
| ------------ | ----------------------------------------------------------- |
| `square`     | Enclose the icon in a square.                               |
| `circle`     | Enclose the icon in a circle.                               |
| `search`     | Enclose the icon in a magnifying glass shape.               |
| `strike`     | Draw a strike-through line over the icon.                   |
| `filled`     | Draw the enclosing shape as a solid shape.                  |
| `monospaced` | For text icons only. Draw the text using a monospaced font. |

### Geometric transformations

| Keyword            | Description                                                                                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `flip-x`           | Flip the icon horizontally.                                                                                                                                                  |
| `flip-y`           | Flip the icon vertically.                                                                                                                                                    |
| `move-x=<percent>` | Move the icon horizontally by the specified distance, expressed as percentage of the icon's width. For example `move-x=10` to move 10% right or `move-x=-5` to move 5% left. |
| `move-y=<percent>` | Move the icon vertically by the specified distance, expressed as percentage of the icon's height.                                                                            |
| `scale=<percent>`  | Adjust the scale at which the icon is drawn. For example `scale=120` to enlarge to 100%, or `scale=90` to shrink to 90%.                                                     |
| `rotate=<degrees>` | Rotate the icon by the specified number of degrees. For example `rotate=90` to rotate 90 degrees anticlockwise.                                                              |

Examples:

| Specifier string                                         | Icon generated                                                         |
| -------------------------------------------------------- | ---------------------------------------------------------------------- |
| `symbol:signpost.right`                                  | <Icon spec="rotate symbol:signpost.right" />                           |
| `flip-x symbol:signpost.right`                           | <Icon spec="flip_x symbol:signpost.right" />                           |
| `move-y=-50 symbol:signpost.right`                       | <Icon spec="move_y=-50 symbol:signpost.right" />                       |
| `scale=50 symbol:signpost.right`                         | <Icon spec="scale=50 symbol:signpost.right" />                         |
| `rotate=90 symbol:signpost.right`                        | <Icon spec="rotate=90 symbol:signpost.right" />                        |
| `square filled move-x=4 move-y=-4 scale=115 rotate=45 T` | <Icon spec="square filled move_x=4 move_y=-4 scale=115 rotate=45 T" /> |

### Color and aspect

| Keyword           | Description                                                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `preserve-color`  | The base icon will be displayed in its original colors instead of used as a monochrome mask. (This is applied implicitly to emoji and color Iconify icons.) |
| `preserve-aspect` | If the base icon is not square, it by default rendered into a square canvas. With this modifier, the icon will be rendered with its original aspect ratio.  |

Example: 

```json
{
  icon: "preserve-color file:rainbow.png"
}
```

::: tip Negative modifiers

In some cases it may be useful to explicitly negate a modifier. This is done by
appending `=0`. For example, to remove the implicit color rendering from an
Iconify icon, use `preserve-color=0`.

:::

<!-- ## Icon modifiers in config

All [icon modifiers](#icon-modifiers) may alternatively be specified as
properties in the config alongside the icon string, instead of in the icon
string itself. For example:

```json
{
  "icon": "iconify:mdi:home",
  "square": true,  
  "flip-y": true,
  "rotate": 45
}
``` -->

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
