---
aside: true
---

# Paths and identifiers

This page lists the various file and folder paths and identifiers used by
PopClip.

<EditionSwitcher />

## File and folder paths

Showing details for <b><Edition /></b>.

| File or folder             | Path and description                                                                                                                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App                        | <Edition code base="/Applications/PopClip.app" setapp="/Applications/Setapp/PopClip.app" /><br>Default and recommended location of the PopClip app bundle.                                                                                   |
| Preferences file           | <Edition code base="~/Library/Preferences/com.pilotmoon.popclip.plist" setapp="~/Library/Preferences/com.pilotmoon.popclip-setapp.plist" /><br>PopClip's settings are stored here.                                                           |
| Application Support folder | <Edition code base="~/Library/Application Support/PopClip" setapp="~/Library/Application Support/com.pilotmoon.popclip-setapp" /><br> PopClip's extensions and supporting files (e.g. logs, purchase info) are stored here.                  |
| Caches folder              | <Edition code base="~/Library/Caches/com.pilotmoon.popclip" setapp="~/Library/Caches/com.pilotmoon.popclip-setapp" /><br>PopClip's caches files are stored here. This is used for local copies of remote resources such as downloaded icons. |

## Identifiers

Showing details for <b><Edition /></b>.

| Identifier         | Value and description                                                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bundle identifier  | <Edition code base="com.pilotmoon.popclip" setapp="com.pilotmoon.popclip-setapp" /><br>The unique app identifier for PopClip.                                                       |
| Keychain item name | <Edition code base="PopClip Extension" setapp="PopClip Extension (Setapp)" /><br>Passwords and login tokens for extensions are stored in the user's login keychain under this name. |
