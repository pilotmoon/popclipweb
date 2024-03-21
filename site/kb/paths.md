---
aside: true
---

# Paths and identifiers

This page lists the various file and folder paths and identifiers used by
PopClip.

## File and folder paths

| File or folder             | Path and description                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| App                        | `/Applications/PopClip.app` (Standalone), `/Applications/Setapp/PopClip.app` (Setapp)<br>Recommended location of the PopClip app bundle.                                                                                                                                                                                                                                                                              |
| Preferences file           | `~/Library/Preferences/com.pilotmoon.popclip.plist` (All editions)<br>PopClip's settings are stored here.                                                                                                                                                                                                                                                                                                                            |
| Application Support folder | `~/Library/Application Support/PopClip` (All editions)<br>PopClip's extensions and supporting files (e.g. logs, purchase info) are stored here.                                                                                                                                                                                                                                                                                      |
| Caches folder              | `~/Library/Caches/com.pilotmoon.popclip` (Standalone, Mac App Store), `~/Library/Caches/com.pilotmoon.popclip-setapp` (Setapp)<br>PopClip's cached files are stored here. This is used for local copies of remote resources such as downloaded icons.                                                                                                                                                                                |
| Additional paths           | `~/Library/Application Support/PopClip_backup`, `~/Library/Preferences/com.pilotmoon.popclip_backup.plist`.<br>These backups might sometimes be created by PopClip when it performs a housekeeping task. They can be safely deleted.<br> `~/Library/Application Support/com.pilotmoon.popclip`, `~/Library/Application Support/com.pilotmoon.popclip-setapp`<br>These folders may also exist, containing some non-essential log files. |

## Identifiers

| Identifier         | Value and description                                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Bundle identifier  | `com.pilotmoon.popclip` (Standalone), `com.pilotmoon.popclip-setapp` (Setapp)<br>The unique app identifier for PopClip.        |
| Keychain item name | `com.pilotmoon.popclip` (All editions)<br>Passwords and login tokens for extensions are stored in the user's iCloud keychain under this name. |
