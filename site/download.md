<script setup>
import Button from '/components/Button.vue';
import Download from '/components/Download.vue';
import Link from "/components/Link.vue";
import { data } from "/components/data/releases.data";

const prod = data.production[0];
const beta = data.beta[0];
</script>

# Download PopClip

## Latest Release

<Download
name="PopClip"
:title="prod.versionString"
:date="prod.date"
:size="prod.size"
:os="prod.minimumSystemVersion"
notes="/changelog"
reqsBefore="Universal for Apple Silicon and Intel; "
type="production"
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
:title="beta.versionString"
:date="beta.date"
:size="beta.size"
:os="beta.minimumSystemVersion"
notes="/changelog-beta"
reqsBefore="Universal for Apple Silicon and Intel; "
type="beta"
/>


**Beta installation:** Install in the Applications folder, replacing any existing copy of the PopClip app. (Settings and extensions will be preserved.)

Anyone is welcome to download and use the beta release, which is a preview of the next version of PopClip. The beta release is more likely to contain bugs. Please report any issues you find. 

## Older Releases

This list gives the last supported release for each macOS version or processor type.

<!-- - **PopClip 2021.4** (30 Apr 2021)<br>
  Requires macOS 10.12.6 or above. Processors: Apple Silicon, Intel 64-bit.<br>
  [Download]() <span :class="$style.diminish">(Zip file, 2.73 Mb)</span>

- **PopClip 2021.4** (30 Apr 2021)<br>
  Requires macOS 10.12.6 or above. Processors: Apple Silicon, Intel 64-bit.<br>
  [Download]() <span :class="$style.diminish">(Zip file, 2.73 Mb)</span>

- **PopClip 2021.4** (30 Apr 2021)<br>
  Requires macOS 10.12.6 or above. Processors: Apple Silicon, Intel 64-bit.<br>
  [Download]() <span :class="$style.diminish">(Zip file, 2.73 Mb)</span>

- **PopClip 2021.4** (30 Apr 2021)<br>
  Requires macOS 10.12.6 or above. Processors: Apple Silicon, Intel 64-bit.<br>
  [Download]() <span :class="$style.diminish">(Zip file, 2.73 Mb)</span> -->