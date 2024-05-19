---
titleTemplate: false
editLink: false
lastUpdated: false
---

<script setup>
import Download from '/src/Download.vue';
import AaLink from "/src/AaLink.vue";
import InfoBox from '/src/InfoBox.vue';
import { data } from "/src/data/releases.data";
import { SetappIcon, AppstoreIcon } from 'vue3-simple-icons'
import { formatDate, formatSize, formatArchs } from "/src/helpers/formatters";

const prod = data.production[0];
const beta = data.beta[0];
const pinned = data.production.filter((r) => r.pin);

</script>

# Download PopClip

## Latest Release

<Download
name="PopClip"
:ver="prod.versionString"
:date="prod.date"
:size="prod.size"
:os="prod.minimumSystemVersion"
:archs="prod.archs"
:url="prod.url"
notes="/changelog"
channel="production"
/>

**Installation:** Unzip and move the PopClip app to your Applications folder.
See [First Launch](/guide/install#first-launch) for the next steps.

**Free Trial:** PopClip operates in trial mode until you register a license key.
The trial is fully functional and includes all features for 250 uses.

::: tip Other ways to get PopClip

<!-- If you already bought PopClip from the&nbsp;<AppstoreIcon style="fill: var(--vp-c-text-1); display: inline-block; height:16px; vertical-align: middle; margin:  0 -4px 0 -3px;" />&nbsp;<AaLink cfg="mas.storeUrl">Mac App Store</AaLink>, you can sign in to the store and install PopClip
again for free. -->

If you're a&nbsp;<SetappIcon style="fill: var(--vp-c-text-1); display: inline-block; height:16px; vertical-align: middle; margin: 0 -7px 0 -3px;" />&nbsp;<AaLink cfg="setapp.referralUrl">Setapp</AaLink> subscriber, PopClip is included
in your subscription. You can install PopClip from the Setapp app.

If you use [Homebrew](https://brew.sh/), you can install PopClip with the command
`brew install popclip`.

:::

## Older Releases

This list gives the last supported release for each macOS version or processor
type.

<ul>
  <li v-for="r in pinned">
    <b>PopClip {{ r.versionString }}</b> ({{ formatDate(r.date) }})<br>
    Requires macOS {{ r.minimumSystemVersion }} or above. {{ formatArchs(r.archs) }}.<br>
    <DownloadButton :href="r.url" size="smaller" theme="outline" />&ensp;Zip file, {{ formatSize(r.size) }}
  </li>
</ul>

Download links for some further old versions are available on the
[Version History](/changelog) page.

### License key for legacy macOS

You may use the following license key to unlock PopClip for free on any macOS version before 10.15:
[Download License Key](https://www.popclip.app/api/v2/licenseKeys/lk_iimPQ62Egziy/file?token=354IB4K45TwF1cLppgYdXKFOVQIq49GtyYxw4YAjIe86DD9ZpgMbKTh)

(Install and run PopClip first, then save the `.popcliplicense` file and double-click it.)

## Beta Release

See [Beta](/beta).
