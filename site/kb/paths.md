---
aside: true
---

<script setup lang="ts">
import EditionSwitcher from "../components/EditionSwitcher.vue";
import Ed from "../components/Ed.vue";
</script>

# Paths and identifiers

This page lists the various file and folder paths and identifiers used by PopClip.

<EditionSwitcher />

## File and folder paths

Showing details for <b><Ed /></b>.

| File or folder             | Path                                                                                                                                   | Description                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| App                        | <Ed code base="/Applications/PopClip.app" setapp="/Applications/Setapp/PopClip.app" />                                                 | Default and recommended location of the PopClip app bundle.                                                         |
| Preferences file           | <Ed code base="~/Library/Preferences/com.pilotmoon.popclip.plist" setapp="~/Library/Preferences/com.pilotmoon.popclip-setapp.plist" /> | PopClip's settings are stored here.                                                                                 |
| Application Support folder | <Ed code base="~/Library/Application Support/PopClip" setapp="~/Library/Application Support/com.pilotmoon.popclip-setapp" />           | PopClip's extensions and supporting files (e.g. logs, purchase info) are stored here.                               |
| Caches folder              | <Ed code base="~/Library/Caches/com.pilotmoon.popclip" setapp="~/Library/Caches/com.pilotmoon.popclip-setapp" />                       | PopClip's caches files are stored here. This is used for local copies of remote resources such as downloaded icons. |

## Identifiers

Showing details for <b><Ed /></b>.

| Identifier         | Value                                                                          | Description                                                                                        |
| ------------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Bundle identifier  | <Ed code base="com.pilotmoon.popclip" setapp="com.pilotmoon.popclip-setapp" /> | The unique app identifier for PopClip.                                                             |
| Keychain item name | <Ed code base="PopClip Extension" setapp="PopClip Extension (Setapp)" />       | Passwords and login tokens for extensions are stored in the user's login keychain under this name. |
