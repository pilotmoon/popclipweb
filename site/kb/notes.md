# Technical notes

This page is a home for some technical details that didn't quite fit anywhere
else.

## Release terminology

The documentation uses the following terminology to refer to PopClip releases:

- **Edition:** _Standalone_, _Mac App Store_ or _Setapp_. (See:
  [Obtaining PopClip](/guide/install#obtaining-popclip).)
- **Channel:** [Production](/download) or [Beta](/beta).

## Version numbering

PopClip versions are presented in the form `version string (build number)`, for
example `2023.7 (4151)`, with the following meaning:

- **Version string:**

  - **Production releases:** Production releases of PopClip have a version
    string in the form `year.month`, e.g. `2023.7`, corresponding to when the
    version was released. In case of multiple releases in the same month, a
    third number is added, e.g. `2023.7.1`.

  - **Beta releases:** Beta versions have version strings such as `Build 4151`
    which are not related to the release date.

- **Build number:** The number in parentheses after the version string is the
  build number, which precisely identifies the release. It always increases
  monotonically, so a higher build number means a newer release.

::: info Build number anomaly

The build number is consistent across all editions and release channels, except
that the Mac App Store edition build number is always 1000000 higher than the
other editions. For example, version `2023.7 (4151)` of the Standalone Edition
is the same version as `2023.7 (1004151)` of the Mac App Store Edition.

:::

## How to take screenshots of PopClip

> When I try to take a screenshot, the PopClip bar disappears. Is there a secret
> to taking such a screenshot?

In Terminal, enter:

`defaults write com.pilotmoon.popclip ScreenshotMode -bool YES`

then Quit and restart PopClip. Now you can use ⌘⇧4 to take a shot, and PopClip
won't disappear when you press the keys.

When you've done with screenshots and want to go back to normal:

`defaults write com.pilotmoon.popclip ScreenshotMode -bool NO`

## How to find all instances of PopClip.app on your Mac

Terminal command:

```
mdfind "kMDItemCFBundleIdentifier == 'com.pilotmoon.popclip*'"
```

Example output:

```
/Applications/PopClip.app
/Users/nick/Downloads/PopClip.app
/Applications/Setapp/PopClip.app
```

## Transfer extensions and settings to a different Mac

Whilst there is no built in import/export or sync (yet), you can manually copy
your existing extensions and settings to a different Mac by copying across the following:

Extensions folder:

`~/Library/Application Support/PopClip/Extensions` folder

Preferences file:

`~/Library/Preferences/com.pilotmoon.popclip.plist`
