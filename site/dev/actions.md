---
outline: deep
titleTemplate: :title — PopClip Developer
---
# Actions

Action properties can be placed either in an `action` dictionary, in an `actions` array, or at the top level. Properties set at the top level will apply to all actions unless
overridden in the individual action.

::: details Example: Action properties at top level

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

::: details Example: Single action

Consider this extension, which defines a single action:

```yaml
#popclip
name: Stickies
action: 
  service name: Make Sticky
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

## Common properties

The following keys define properties common to all action types. All properties are optional.

| Key                  | Type                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`              | String (Localizable) | The title is displayed on the action button if there is no icon. For extensions with icons, the title is displayed in the tooltip. If omitted, the action will take the extension name as its title.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `icon`               | String               | The icon to show on the action button. See [Icons](./icons) for the icon specification format. If omitted, the action will take the extension icon as its icon. To explicitly specify no icon, set this field to `null`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `identifier`         | String               | A string to identify this action. In shell script and AppleScript actions, the identifier is passed to the script. The script can use this to find out which action was pressed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `regex`              | String               | A [Regular Expression](http://regularexpressions.info/) to be applied to the selected text. The action will appear only if the text matches the regex, and the matching part of the text is passed to the action. The regex engine used is Cocoa's `NSRegularExpression`, which uses the [ICU specification](https://unicode-org.github.io/icu/userguide/strings/regexp.html) for regular expressions. _Note: There is no need to use your own regex to match URLs, email addresses or file paths. Use one of the `requirements` keys `url`, `urls`, `email`, `emails` or `path` instead. Also be careful to avoid badly crafted regexes which never terminate against certain inputs._ |
| `requirements`       | Array                | Array consisting of zero or more of the strings listed in [the `requirements` array](#the-requirements-array). All the requirements in the array must be satisfied for the action to appear. If the field is omitted, `[text]` is used by default. To specify no requirements, supply an empty array: `[]`.                                                                                                                                                                                                                                                                                                                                                                             |
| `excluded apps`      | Array                | Array of bundle identifiers of applications. The action will not appear when PopClip is being used in any of the specified apps.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `required apps`      | Array                | Array of bundle identifiers of applications. The action will only appear when PopClip is being used in one of the specified apps. _Note: This field does not make PopClip do a check to see if the app is present on the computer. For that, use the `app` field._                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `before`             | String               | String to indicate an action PopClip should take _before_ performing the main action. See [The `before` and `after` strings](#the-before-and-after-strings).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `after`              | String               | String to indicate an action PopClip should take _after_ performing the main action. See [The `before` and `after` strings](#the-before-and-after-strings).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `app` or `apps`      | Dictionary or Array  | Dictionary, or array of dictionaries, describing the app(s) or website(s) associated with this action. You can, optionally, specify that the app must be present on the system for the action to work. See [The `app` dictionary](#the-app-dictionary).                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `stay visible`       | Boolean              | If `true`, the PopClip popup will not disappear after the user clicks the action. (An example is the Formatting extension.) Default is `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `capture html`       | Boolean              | If `true`, PopClip will attempt to capture HTML and Markdown for the selection. PopClip makes its best attempt to extract HTML, first of all from the selection's HTML source itself, if available. Failing that, it will convert any RTF text to HTML. And failing that, it will generate an HTML version of the plain text. It will then generate Markdown from the final HTML. Default is `false`.                                                                                                                                                                                                                                                                                   |
| `restore pasteboard` | Boolean              | If true, then PopClip will restore the pasteboard to its previous contents after pasting text in the `paste-result` after-step. Default is `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Type-specific keys   | Varies               | See: [Shortcut actions](./shortcut-actions), [Service actions](./service-actions), [URL actions](./url-actions). [Key Press actions](./key-press-actions), [Shell Script actions](./shell-script-actions), [AppleScript actions](./applescript-actions), [JavaScript actions](./js-actions).                                                                                                                                                                                                                                                                                                                                                                                            |

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
| `option-foo=bar` | The option with identifier `foo` must be equal to the string `bar`. This mechanism allows actions to be enabled and disabled via options. Boolean option values map to the strings `1` and `0`.|

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
  and it will be standardized, with `~` and `..` expanded. For example
  `~/Documents` will be passed as `/Users/username/Documents`.

In all three cases, actions can assume that their input is a valid web URL,
email address or path.

Shell Scripts and AppleScripts can still access the original text in the
`POPCLIP_FULL_TEXT` and `{popclip full text}` fields. JavaScript actions will
find the modified text as `popclip.input.matchedText` and the full text as
`popclip.input.text`.

:::

### The `before` and `after` strings

The `cut`, `copy`, `paste` and `paste-plain` values can be used as the `before` string. All the
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
