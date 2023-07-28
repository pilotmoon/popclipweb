<script setup>
import Button from '/components/Button.vue';
import Download from '/components/Download.vue';
import Link from "/components/Link.vue";
import { data } from "/components/data/releases.data";
import { formatDate, formatSize, formatArchs } from "/components/helpers/formatters";

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

**Installation:** Unzip and move the PopClip app to your Applications folder. See [Getting Started](/guide/getting-started#first-launch) for next steps.

**Free Trial:** PopClip operates in free trial mode until you register a license key. The trial is fully functional and includes all features for 150 uses.

::: tip Other ways to get PopClip
If you already bought PopClip from the <Link k="mas.storeUrl">Mac App Store</Link>, you can sign in to the store and install PopClip again for free.

If you're a <Link k="setapp.referralUrl">Setapp</Link> subscriber, PopClip is included in your subscription. You can install PopClip from the Setapp app.

If you use [Homebrew](https://brew.sh/), you can install PopClip with the command `brew install popclip`.
:::

## Beta Release

<Download
name="PopClip"
:ver="beta.versionString"
:date="beta.date"
:size="beta.size"
:os="beta.minimumSystemVersion"
:archs="beta.archs"
:url="beta.url"
notes="/changelog-beta"
channel="beta"
/>


**Beta installation:** Install in the Applications folder, replacing any existing copy of the PopClip app. (Settings and extensions will be preserved.)

Anyone is welcome to download and use the beta release, which is a preview of the next version of PopClip. The beta release is more likely to contain bugs. Please report any issues you find. 

## Older Releases

This list gives the last supported release for each macOS version or processor type.

<ul>
  <li v-for="r in pinned">
    <b>PopClip {{ r.versionString }}</b> ({{ formatDate(r.date) }})<br>
    Requires macOS {{ r.minimumSystemVersion }} or above. {{ formatArchs(r.archs) }}.<br>
    <a :href="r.url">Download</a> (Zip file, {{ formatSize(r.size) }})
  </li>
</ul>

Dwnload links for some more recent old versions are available on the [Version History](/changelog) page.