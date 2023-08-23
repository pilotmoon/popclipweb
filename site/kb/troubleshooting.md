# PopClip Troubleshooting

This page lists common problems and their possible solutions. See also
[Known Issues](/./known-issues) and [FAQ](./faq).

## Solutions to common problems

| Problem                                                        | Possible Solution                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Not all my enabled actions are appearing in the PopClip bar.   | This is normal, because actions only appear when they are applicable in the context.                                                                                                                                                                                                                                           |
| PopClip appears but actions (e.g. Copy) not working properly.  | This is a common problem just after upgrading macOS. Try: [Remove and re-add Accessibility permission](#remove-and-re-add-accessibility-permission), below.                                                                                                                                                                    |
| PopClip doesn't appear when selecting text, in any app.        | Check that PopClip is turned on. See: [Turn PopClip On and Off](/guide/settings#turn-popclip-on-and-off).                                                                                                                                                                                                                      |
|                                                                | Check that PopClip has Accessibility permission. See: [Grant Accessibility permission](/guide/install#granting-accessibility-permission).                                                                                                                                                                                      |
|                                                                | Check whether you can still trigger PopClip using its keyboard shortcut. See: [Activate with a keyboard shortcut](/guide/basics#activate-with-a-keyboard-shortcut).                                                                                                                                                            |
|                                                                | Check whether you have customized your mouse pointer using an app like [MouseScape](https://github.com/alexzielenski/Mousecape) or [Cursor Pro](https://www.ixeau.com/cursor-pro/). PopClip cannot appear automatically if you have a custom mouse pointer.                                                                    |
|                                                                | Check whether you have set custom keyboard shortcuts for Cut, Copy and Paste. PopClip can only appear automatically if your systemwide keyboard shortcuts are the standard ⌘X, ⌘C and ⌘V.                                                                                                                                      |
|                                                                | Check that you are running the latest version of PopClip. See [About pane](/guide/settings#about-pane) and refer to [Version History](/changelog) to find out the latest version.                                                                                                                                              |
|                                                                | Try quitting and restarting PopClip.                                                                                                                                                                                                                                                                                           |
|                                                                | Try rebooting your Mac.                                                                                                                                                                                                                                                                                                        |
| PopClip doesn't appear when selecting text, in a specific app. | Check the [Known Issues](./known-issues) to see if there is a known problem with that specific app.                                                                                                                                                                                                                            |
|                                                                | Check whether you have excluded the app from PopClip. See: [Excluded Apps pane](/guide/settings#excluded-apps-pane).                                                                                                                                                                                                           |
|                                                                | Try quitting and restarting that app.                                                                                                                                                                                                                                                                                          |
| PopClip unreliable / disappearing.                             | Check whether you are using the 3rd party macOS extension "Add to Fantastical" which comes with [Fantastical](https://flexibits.com/fantastical). This is in System Settings → Privacy & Security → Extensions → Installed extensions. PopClip may behave unreliably if this is enabled. |
| A specific extension is not working                            | Try downloading the latest version of the extension. (Note that extensions do not autmatically update.)                                                                                                                                                                                                                        |
| PopClip app launches but no user interface appears.            | You may be using [Bartender](https://www.macbartender.com/), [Vanilla](https://matthewpalmer.net/vanilla/) or a similar app. Disable it or configure it not to hide PopClip.                                                                                                                                                                 |
| PopClip has locked up / using 100% CPU                         | Force Quit PopClip using Activity Monitor. If this happens repeatedly, please report it and any steps that cause the lock-up.                                                                                                                                                                                                  |

## Detailed procedures

### Remove and re-add Accessibility permission

The following procedure can help if PopClip is not working properly. It removes
PopClip from the Accessibility permission list and then adds it again. It is
most likely to be required after upgrading macOS from one version ot another.

1. Quit PopClip

2. Go to System Settings → Privacy & Security → Accessibility

3. In the list, highlight PopClip and then remove it using the "–" (minus)
   button. (Fully remove it, don't just uncheck it.)

4. Use the "+" (plus) button add PopClip again to the list.

![](./shot-ax-remove-1.png "Remove and re-add to the list with minus button")
