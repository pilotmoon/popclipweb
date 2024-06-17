---
aside: false
---

# Troubleshooting

This page lists common problems and their possible solutions, as well as known
issues with specific apps.

## Solutions to common problems

| Problem                                                          | Possible Solution                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Not all of the enabled actions are appearing in the PopClip bar. | This is normal, because actions only appear when they are applicable. See: [Why are some actions not appearing?](#why-are-some-actions-not-appearing)                                                                                                                                                                                                                |
| 'Copy' action not working.                                       | This is a common problem just after upgrading macOS. Solution: [Remove and re-add Accessibility permission](#remove-and-re-add-accessibility-permission).                                                                                                                                                                                                            |
| Problem using PopClip in a specific app.                         | Check the [App compatibility](#app-compatibility) section to see if there is a known problem with that specific app.                                                                                                                                                                                                                                                 |
|                                                                  | Check whether you have excluded the app from PopClip. See: [Excluded Apps pane](/guide/settings#excluded-apps-pane).                                                                                                                                                                                                                                                 |
|                                                                  | Try quitting and restarting that app, then quitting and restarting PopClip.                                                                                                                                                                                                                                                                                          |
| PopClip bar doesn't appear when selecting text, in any app.      | Check that PopClip is turned on. See: [Turn PopClip On and Off](/guide/settings#turn-popclip-on-and-off).                                                                                                                                                                                                                                                            |
|                                                                  | Check that PopClip has Accessibility permission. See: [Grant Accessibility permission](/guide/install#granting-accessibility-permission).                                                                                                                                                                                                                            |
|                                                                  | Check whether you have customized your mouse pointer using an app like [MouseScape](https://github.com/alexzielenski/Mousecape) or [Cursor Pro](https://www.ixeau.com/cursor-pro/). PopClip cannot appear automatically if you have a custom mouse pointer.                                                                                                          |
|                                                                  | Check whether you have set custom keyboard shortcuts for Cut, Copy and Paste. PopClip can only work if your systemwide keyboard shortcuts are the standard ⌘X, ⌘C and ⌘V.                                                                                                                                                                                            |
|                                                                  | Check whether you are using the 3rd party macOS extension "Add to Fantastical" which comes with [Fantastical](https://flexibits.com/fantastical). This is in System Settings → Privacy & Security → Extensions → Installed extensions. PopClip may behave unreliably if this is enabled.                                                                             |
|                                                                  | Check that you are running the latest version of PopClip.                                                                                                                                                                                                                                                                                                            |
|                                                                  | Try quitting and restarting PopClip.                                                                                                                                                                                                                                                                                                                                 |
|                                                                  | Try rebooting your Mac.                                                                                                                                                                                                                                                                                                                                              |
| Delay before PopClip bar appears.                                | If "3-finger drag" mode is enabled in Trackpad settings, there will be a delay. This can't be avoided because the delay is inserted by macOS.                                                                                                                                                                                                                        |
| PopClip bar disappearing too quickly.                            | PopClip does not disappear on a timer, but only when you move the mouse away, click, scroll, or begin to type. (See: [Make popclip disappear](/guide/basics#make-popclip-disappear).) Keep the mouse near the PopClip bar to prevent it disappearing.                                                                                                                |
| A specific extension is not working.                             | Try downloading the latest version of the extension. (Note that extensions do not automatically update.)                                                                                                                                                                                                                                                              |
| PopClip app launches but no user interface appears.              | You may be using an icon-hider app to hide PopClip's menu bar icon. Disable it or configure it not to hide PopClip. See [note](#a-note-about-icon-hider-apps).                                                                                                                |
| PopClip has locked up / using 100% CPU.                          | Force Quit PopClip using Activity Monitor. If this happens repeatedly, please report it and any steps that cause the lock-up.                                                                                                                                                                                                                                        |
| A "click" or "purr" sound when selecting text.                   | Check whether you are using either [Alfred](https://www.alfredapp.com/) or [LaunchBar](https://obdev.at/products/launchbar/index.html), and have the clipboard merging feature enabled. The way PopClip works is triggering this feature, so you will need to disable it. The checkbox is "Fast append selected text" in Alfred and "Enable ClipMerge" in LaunchBar. |
| Can't set "Start at login"                                       | Quit PopClip and move it to the `/Applications` folder, if it is not there already. Then go to System Settings → Login Items → Open at Login. Delete any existing entry for PopClip from the list. Now try add PopClip again.                                                                                                                                        |

## App compatibility

The following table lists apps that are known to have problems with PopClip.

| App                                                                 | Issue                                                                                                                                                                                                                    | Status             |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| 2Do                                                                 | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| Adobe, all apps (Acrobat, Dreamweaver, Illustrator, InDesign, etc.) | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| Alacritty                                                           | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| Apple Books                                                         | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| Banktivity                                                          | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| BarBee                                                          | When used to hide PopClip's menu bar icon, it may prevent PopClip's user interface appearing. Workaround: disable icon hiding for PopClip.(See [note](#a-note-about-icon-hider-apps)).                                                                                                                         | Working on it           |
| Bartender                                                           | When used to hide PopClip's menu bar icon, it may prevent PopClip's user interface appearing. Workaround: disable icon hiding for PopClip. (See [note](#a-note-about-icon-hider-apps)).                                                                                                                          | Working on it          |
| BetterTouchTool                                                             | When used to hide PopClip's menu bar icon, it may prevent PopClip's user interface appearing. Workaround: disable icon hiding for PopClip. (See [note](#a-note-about-icon-hider-apps)).                                                                                                                            | Working on it          |
| Citrix Receiver                                                     | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| Collectorz                                                          | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| Crossover                                                           | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| Cursor Pro                                                          | Using this app to change the mouse cursor will cause PopClip to be unreliable or not appear at all.                                                                                                                                           | Can't fix          |
| emacs                                                               | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| Fanstatical                                                         | PopClip may behave unreliably if the macOS extension "Add to Fantastical", which comes with Fantastical, is enabled. This is in System Settings → Privacy & Security → Extensions → Installed extensions.                | To be investigated |
| Final Draft                                                         | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| iBar                                                          | When used to hide PopClip's menu bar icon, it may prevent PopClip's user interface appearing. Workaround: disable icon hiding for PopClip. (See [note](#a-note-about-icon-hider-apps)).                                                                                                                         | Working on it          |
| Ice                                                          | When used to hide PopClip's menu bar icon, it may prevent PopClip's user interface appearing. Workaround: disable icon hiding for PopClip. (See [note](#a-note-about-icon-hider-apps)).                                                                                                                         | Working on it          |
| Hidden Bar                                                          | When used to hide PopClip's menu bar icon, it may prevent PopClip's user interface appearing. Workaround: disable icon hiding for PopClip. (See [note](#a-note-about-icon-hider-apps)).                                                                                                                         | Working on it          |
| JetBrains, all apps (IntelliJ IDEA, PyCharm, WebStorm, etc.)        | PopClip will not appear automaticallty, but can be made to appear by using the keyboard shortcut or AppleScript trigger. ([More info](https://forum.popclip.app/t/about-popclip-compatibility-with-jetbrains-ides/1579).)                                                                                                | Can't fix          |
| KeePassX                                                            | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| Kindle for Mac                                                      | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| MacVIM                                                              | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| Mail Perspectives 2                                                 | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| Microsoft Word                                                      | In Word, text may be copied to the clipboard if you press delete or start typing after selecting text. As a workaround, you can add Word to PopClip's excluded apps list and trigger PopClip with the keyboard shortcut. | Can't fix          |
| MouseScape                                                          | Using this app to change the mouse cursor will cause PopClip to be unreliable or not appear at all.                                                                                                                                           | Can't fix          |
| Mozilla Firefox                                                     | PopClip will fail with certain Firefox extensions installed. Ones know to cause problems are: Tiny Menu, Menu Wizard.                                                                                                    | Can't fix          |
| NeoOffice suite                                                     | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| Oracle SQL Developer                                                | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| Parallels Desktop                                                   | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| Pixelmator, Pixelmator Pro                                          | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| QuarkXPress                                                         | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| qutebrowser                                                         | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| ReadKit                                                             | PopClip will not work in this app.                                                                                                                                                                                       | To be investigated |
| Revolver Office                                                     | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| ScreenPal                                                           | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| Screens                                                             | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| Superlist                                                           | PopClip will not work in this app.                                                                                                                                                                                       | To be investigated |
| Unity3D                                                             | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| Vanilla                                                             | When used to hide PopClip's menu bar icon, it may prevent PopClip's user interface appearing. Workaround: disable icon hiding for PopClip. (See [note](#a-note-about-icon-hider-apps)).                                                                                                                            | Working on it          |
| vim                                                                 | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |
| VMWare                                                              | PopClip will not work in this app.                                                                                                                                                                                       | Can't fix          |

## Further information

### Why are some actions not appearing?

![](media/shot-missing-actions-1.png#bar "Only Search and Copy are appearing! Is there something wrong?")

To keep visual clutter down, PopClip's bar is context-sensitive; it only displays
actions relevant to your current text selection. Here's a quick
rundown:

- **Cut & Paste:** They'll show up when you use PopClip in text-editing apps,
  like Mail or TextEdit. Don't expect them when selecting read-only text on
  webpages.

- **Open Link:** Only visible when a URL is selected, e.g.,
  `https://apple.com/mac/`.

- **Dictionary:** Appears when a dictionary word is highlighted.

- **Reveal in Finder:** This pops up for valid local file or folder paths, like
  `~/Documents/`.

- **Spelling:** For editable, misspelled words when there are correction
  suggestions in your set languages.

- **Extension-added actions:** These also have specific conditions; they show up
  depending on their designed context.

If, after understanding the above, you believe an action should be visible but
isn't, please [provide details](/support). Specify the action, the app you're
in, and the exact text selected.

### Remove and re-add Accessibility permission

The following procedure can help if PopClip is not working properly. It removes
PopClip from the Accessibility permission list and then adds it again. It is
most likely to be required after upgrading macOS from one version to another.

1. Quit PopClip

2. Go to System Settings → Privacy & Security → Accessibility

3. In the list, highlight PopClip and then remove it using the "–" (minus)
   button. (Fully remove it, don't just uncheck it.)

![](./media/shot-ax-remove-1.png#h400 "Remove from the list with minus button")

4. Use the "+" (plus) button add PopClip again to the list.

### A note about icon-hider apps

**Bartender, Vanilla, Ice, Hidden Bar, BarBee, BetterTouchTool, iBar**

Unfortunately, PopClip is currently incompatible with icon-hider apps such as Bartender. This is because PopClip always displays its menu below the current position of the menu bar icon. When Bartender and similar apps hide the icon, they actually move the icon offscreen. This causes PopClip to attempt to display its menu at offscreen coordinates, making the window invisible.

This issue is becoming more prevalent with the rising popularity of menu bar manager apps. I am currently working on a technical resolution for this problem to ship in a future update. In the meantime, I appreciate your patience with the current design.
