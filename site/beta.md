<script setup>
import Changelog from '/components/Changelog.vue'
import Download from '/components/Download.vue';
import { data } from "/components/data/releases.data";
const beta = data.beta[0];
</script>

# PopClip Beta

Anyone is welcome to download and use the beta release, which is a preview of the next version of PopClip. The beta release is more likely to contain bugs. Please report any issues you find.

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

**Beta installation:** Install in the Applications folder, replacing any existing copy of the PopClip app. (Settings and extensions will be preserved.)


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
