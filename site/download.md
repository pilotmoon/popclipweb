---
titleTemplate: false
editLink: false
lastUpdated: false
---
<script setup>
import DownloadButton from '/src/DownloadButton.vue';
import Download from '/src/Download.vue';
import Link from "/src/Link.vue";
import { data } from "/src/data/releases.data";
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

**Installation:** Unzip and move the PopClip app to your Applications folder. See [First Launch](/guide/install#first-launch) for next steps.

**Free Trial:** PopClip operates in free trial mode until you register a license key. The trial is fully functional and includes all features for 150 uses.

::: tip Other ways to get PopClip
If you already bought PopClip from the <Link k="mas.storeUrl">Mac App Store</Link>, you can sign in to the store and install PopClip again for free.

If you're a <Link k="setapp.referralUrl">Setapp</Link> subscriber, PopClip is included in your subscription. You can install PopClip from the Setapp app.

If you use [Homebrew](https://brew.sh/), you can install PopClip with the command `brew install popclip`.
:::

## Older Releases

This list gives the last supported release for each macOS version or processor type.

<ul>
  <li v-for="r in pinned">
    <b>PopClip {{ r.versionString }}</b> ({{ formatDate(r.date) }})<br>
    Requires macOS {{ r.minimumSystemVersion }} or above. {{ formatArchs(r.archs) }}.<br>
    <DownloadButton :href="r.url" size="smaller" theme="outline" />&ensp;Zip file, {{ formatSize(r.size) }}
  </li>
</ul>

Download links for some further old versions are available on the [Version History](/changelog) page.

## Beta Release

See: [Beta](/beta).
