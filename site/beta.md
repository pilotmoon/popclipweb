---
titleTemplate: false
editLink: false
lastUpdated: false
---
<script setup>
import Changelog from '/src/Changelog.vue'
import Download from '/src/Download.vue';
import { data } from "/src/data/releases.data";
const beta = data.beta[0];
</script>

# PopClip Beta

Anyone is welcome to use the beta release, a preview of the next version of PopClip. The beta release is more likely to contain bugs. Please report any issues you find.

:::tip Beta access for Setapp customers

<!-- - Mac App Store customers can download and use the beta from this page. It will pick up your existing settings and detect your purchase. -->
- Setapp users should *not* download this beta. Instead, enable the beta updates option in Setapp settings, then click "Check for Updates..." in the Setapp menu.

:::

## Latest Beta

<Download
name="PopClip"
:ver="beta.versionString"
:date="beta.date"
:size="beta.size"
:os="beta.minimumSystemVersion"
:archs="beta.archs"
:url="beta.url"
notes="#beta-version-history"
channel="beta"
/>

**Beta installation:** Install in the Applications folder, replacing any existing copy of the PopClip app. PopClip beta will preserve your current settings and extensions.

## Beta Version History

<div :class="$style.history">
<Changelog channel="beta" />
</div>

<style module>
.history h2 {
  border: none;
  font-size: 1.25em;
}
</style>
