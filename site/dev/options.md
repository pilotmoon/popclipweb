---
outline: deep
titleTemplate: :title — PopClip Developer
---

# Options

An extension declares user-settable options with the `options` array at the
top level of its [config](./config). Options are presented to the user in a
preferences user interface window and are saved in PopClip's preferences on
behalf of the extension. Options appear in the UI in the order they appear in
the `options` array.

## Option properties

An option dictionary has the following structure.

| Key             | Type                 | Required?                    | Description                                                                                                                                                                                                                                                     |
| --------------- | -------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `identifier`    | String               | Required                     | Identifying string for this option. This is passed to your script. The identifier will be downcased or upcased for AppleScript and Shell Script targets, respectively — see [Script variables](./script-variables.md).                                          |
| `type`          | String               | Required                     | See [Option types](#option-types).                                                                                                                                                                                                                              |
| `label`         | String (Localizable) | Optional                     | The label to appear in the UI for this option. If omitted, the identifier is displayed.                                                                                                                                                                         |
| `description`   | String (Localizable) | Optional                     | A longer description to appear in the UI to explain this option. May contain clickable links, written either as bare URLs or in Markdown syntax: `[label](https://example.com)`.                                                                                |
| `default value` | String               | Optional                     | This field specifies the default value of the option. If omitted, `string` options default to the empty string, `boolean` options default to `true`, and `multiple` options default to the top item in the list. A `secret` field may not have a default value. |
| `values`        | Array                | Required for `multiple` type | Array of strings representing the possible values for the multiple choice option.                                                                                                                                                                               |
| `value labels`  | Array                | Optional                     | Array of "human friendly" strings corresponding to the multiple choice values. This is used only in the PopClip options UI, and is not passed to the script. If omitted, the option values themselves are shown.                                                |
| `inset`         | Boolean              | Optional                     | If true, the option field will be shown inset to the right of the label, instead of under it. Default is false.                                                                                                                                                 |
| `icon`          | String               | Optional                     | For `boolean` options only. Specify an icon to appear next to the check box.                                                                                                                                                                                    |
| `multiline`     | Boolean              | Optional                     | For `string` options only. If true, shows a multi-line text field instead of a single-line one. Useful for longer inputs such as prompts. Default is false.                                                                                                     |
| `allow other`   | Boolean              | Optional                     | For `multiple` options only. If true, adds an "Other…" choice to the list, allowing the user to enter a free-text value. Default is false.                                                                                                                      |
| `allow none`    | Boolean              | Optional                     | For `multiple` options only. If true, adds a "None" choice to the list, whose value is the empty string. Default is false.                                                                                                                                      |
| `keychain`      | String               | Optional                     | For `secret` options only. Which keychain the value goes in: `sync` (the default) shares one value across the user's devices via iCloud Keychain; `local` keeps it only on the Mac where it was entered.                                                        |

## Option types

The `type` field of an option dictionary can be one of the following:

| Type       | Description                                                               |
| ---------- | ------------------------------------------------------------------------- |
| `string`   | A text field.                                                             |
| `boolean`  | A checkbox.                                                               |
| `multiple` | A multiple choice list. An array of `values` strings must be provided.    |
| `secret`   | Concealed text entry. The value is persisted in the keychain.             |
| `heading`  | Shows as a text heading in the settings user interface. Carries no value. |
