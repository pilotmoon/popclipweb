---
aside: true
---

<script setup lang="ts">
import EditionSwitcher from "../components/EditionSwitcher.vue";
import Ed from "../components/Ed.vue";
import EdLabel from "../components/EdLabel.vue";
</script>

# Paths and identifiers

This page describes the various file paths and identifiers used by PopClip.

<EditionSwitcher />

## File and directory paths

Showing details for <b><EdLabel /></b>.

| Path                       | Value                                                                                                                                  | Description                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| App                        | <Ed code base="/Applications/PopClip.app" setapp="/Applications/Setapp/PopClip.app" />                                                 | Default and recommended location of the PopClip app bundle.   |
| Preferences File           | <Ed code base="~/Library/Preferences/com.pilotmoon.popclip.plist" setapp="~/Library/Preferences/com.pilotmoon.popclip-setapp.plist" /> | PopClip's settings are stored here.                           |
| Application Support Folder | <Ed code base="~/Library/Application Support/PopClip" setapp="~/Library/Application Support/com.pilotmoon.popclip-setapp" />           | PopClip's extensions and other support files are stored here. |

## Identifiers

Showing details for <b><EdLabel /></b>.

| Identifier         | Value                                                                          | Description                                                                                  |
| ------------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Bundle identifier  | <Ed code base="com.pilotmoon.popclip" setapp="com.pilotmoon.popclip-setapp" /> | The unique app identifier for PopClip.                                                    |
| Keychain item name | <Ed code base="PopClip Extension" setapp="PopClip Extension (Setapp)" />       | Passwords and login tokens for extensions are stored in the user's keychain under this name. |

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

- **Build number:** The number in parentheses after the version number is the
  build number, which is consistent across all editions and release channels,
  except that the Mac App Store edition build number is always 1000000 higher
  than the other editions. For example, version `2023.7 (4151)` of the
  Standalone Edition is the same version as `2023.7 (1004151)` of the Mac App
  Store Edition.
