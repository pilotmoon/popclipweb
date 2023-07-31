# Actions

The buttons that appear in the PopClip bar perform **actions**. PopClip comes with a set of built-in actions, which are described below. You can add more actions by installing [extensions]().

Actions are context-sensitive, meaning that they only appear when they are relevant. So you won't always see all the actions. (See also: [Actions not appearing]().)

**Settings** for actions can be accessed in the [actions pane]() of PopClip settings.

Some actions respond to **modifier keys**. Hold down the modifier key while clicking the action's button to perform the action with the modifier.

If you hover the pointer over an icon button, you will see **tooltip** with the action's name.

<!-- :::tip Actions not appearing?
PopClip is context-sensitive, meaning that the actions that appear are dependent on the the text content, as well as other context.

Examples:

- The Paste and Cut actions only appear when the text is editable.
- The Open Link action only appears if the selected text contains a link.
- The Dictionary action only appears if the text is a dictionary word.
- The Reveal in Finder action only appears if the text is a file path.
- Spelling correction actions only appear if the text is misspelled and there are suggestions available.
::: -->

## Cut, Copy and Paste

The Cut, Copy and Paste actions work just like the usual clipboard functions on your Mac.

**Availablilty:**

- Copy and Cut require a text selection.
- Cut and Paste require an editable text field.

**Modifiers:**

- Hold down **Shift (⌥)** to perform the action with plain text only. This will remove any formatting from the text.

**Settings:**

- **Show as Icon**: When enabled, shows the actions's button as an icon instead of text.

## Search

The Search action opens a web search for the selected text. The default search engine is Google, but you can change this in the actions's settings.

The search opens in the default browser, unless the current app is a browser in which case the current browser is used instead.

**Availability:**

- Always available, subject to a maximum length limit.

**Modifiers:**

- Hold down the **Shift (⇧)** key to copy the search URL instead of opening it.

**Settings:**

- **Search URL**: The URL of the search engine. The placeholder `***` will be replaced with the selected text. For example, the default Google search URL is `https://www.google.com/search?q=***`.

## Open Link

The Open Link action opens any web URLs (`http:` and `https:`) detected in the selected text. If the text contains multiple web URLs, all of them will open in separate tabs. The action will also detect "URL-like" text lacking a scheme prefix and add `https:` when opening it.

The URLs open in the default browser, unless the current app is a browser in which case the current browser is used instead.

In addition to web URLs, PopClip detects single instances of the following URL schemes: `evernote:`, `omnifocus:`, `spotify:`, `ftp:`, `bluesky:`, `hook:`, `craftdocs:`, `x-devonthink-item`.

**Try it:** `https://apple.com` `xkcd.com` `spotify:track:421Gp1eSmOIcD6alTWowFR`

**Availability:**

- Only available if the selected text contains URL. The URL must appear in the text itself; links that are behind hyperlinks cannot be detected. 

**Modifiers:**

- Hold down the **Shift (⇧)** key to copy the URLs as a list, instead of opening them.

## Dictionary

## Reveal in Finder

## Spelling