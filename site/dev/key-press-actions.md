# Key Press actions

In a Key Press action, PopClip will simulate a key press, or sequence of presses, as if it was performed by the user.

## Properties

A Key Press action is defined by the presence of a `key combo` or `key combos` field, as follows:

| Key          | Type    | Description                                                                                                     |
| ------------ | ------- | --------------------------------------------------------------------------------------------------------------- |
| `key combo`  | String  | The key combination to press, as defined in [String format](#key-combo-string-format).                |
| `key combo`  | Integer | If a number is given, it is interpreted directly as a virtual key code (see below).                             |
| `key combos` | Array   | Instead of a single key combo, you can supply array of them. PopClip will press all the key combos in sequence, waiting 0.1 seconds in between each key press. |

## Input and output

Key Press actions do not receive any input or return any output.

## String format

The string format is a convenient human-readable format that can specify a key and modifiers. It is a space-separated list of zero or more modifiers (the order does not matter), followed by the key to press. The key combo string is not case sensitive.

Some examples:

- `command b` or `command B`- *Hold command, and press 'b' key*
- `option shift .` - *Hold option and shift, and press the dot key*
- `command space` - *Hold command, and press space bar*
- `f1` - *The F1 key on its own with no modifiers*
- `option numpad /` - *Hold option, press '/' key on numeric keypad*
- `option 0x4b` - *0x4b is the hex numeric code for numeric keypad '/'', equivalent to `option numpad /`*

The **key** is specified in one of the following ways:

- **As a character.** For keys which produce a single character. Examples: `A`, `;`, `9`.
- **As a key name.** The following are supported: `return`, `space`, `delete`, `escape`, `left`, `right`, `down`, `up`, and `f1`, `f2`, etc. to `f19`.
- **As a virtual key code.** For more esoteric keys, you can specify the virtual key code numerically. This can be as a decimal number, or a hexadecimal number (starting with `0x`). [This StackOverflow question](http://stackoverflow.com/questions/3202629/where-can-i-find-a-list-of-mac-virtual-key-codes) will help you find the virtual key codes for all the keys.

The **modifiers** are specified with the following keywords:

| Modifier       | Keyword                  |
| -------------- | ------------------------ |
| Command (⌘)    | `command`, `cmd` or `⌘`  |
| Option (⌥)     | `option`, `opt` or `⌥`   |
| Control (⌃)    | `control`, `ctrl` or `^` |
| Shift (⇧)      | `shift` or `⇧`           |
| Numeric Keypad | `numpad`                 |

## Examples

A "highlight" extension supporting a couple of different apps:



A more complex example with a raw key code and using some more fields:

```yaml
# popclip extension snippet - more complex example
name: Paste and Enter
icon: square monospaced ↵
requirements: [paste]
before: paste
key combo: 0x24
```
