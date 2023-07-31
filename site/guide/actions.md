# Using Actions

PopClip comes with a set of built-in actions, which are described below. You can add more actions by installing [extensions]().

To perform an action, click its button in the PopClip bar. If you hover the pointer over a button without clicking, you will see **tooltip** with the action's name.

Some actions respond to **modifier keys**. Hold down the modifier key while clicking the action's button to perform the action with the modifier.

**Settings** for actions can be accessed in the [actions section of PopClip settings]().

:::tip Actions not appearing?
PopClip is context-sensitive, meaning that the actions that appear are dependent on the the text content, as well as other context.

Examples:

- The Paste and Cut actions only appear when the text is editable.
- The Open Link action only appears if the selected text contains a link.
- The Dictionary action only appears if the text is a dictionary word.
- The Reveal in Finder action only appears if the text is a file path.
- Spelling correction actions only appear if the text is misspelled and there are suggestions available.
:::

## Cut, Copy and Paste

The Cut, Copy and Paste actions work just like the corresponding menu items in most apps. Cut and Paste are only available when the text is editable.

**Modifiers:**

- Hold down the **Shift (⌥)** to perform the action with plain text only. This will remove any formatting from the text when copying or pasting.

**Settings:**

- **Show as Icon**: When enabled, shows the actions's button as an icon instead of text.

## Search

The Search action opens a web search for the selected text. The default search engine is Google, but you can change this in the actions's settings.

**Modifiers:**

- Hold down the **Shift (⇧)** key to copy the search URL instead of opening it.

**Settings:**

- **Search URL**: The URL of the search engine. The placeholder `***` will be replaced with the selected text. For example, the default Google search URL is `https://www.google.com/search?q=***`.