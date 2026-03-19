---
titleTemplate: false
editLink: false
lastUpdated: false
---

<script setup>
import Changelog from '/src/Changelog.vue'
import Download from '/src/Download.vue';
import SetappInline from '/src/SetappInline.vue'
import { data } from "/src/data/releases.data";
const beta = data.beta[0];
</script>

# PopClip Beta

Anyone is welcome to use the beta release, a preview of the next version of
PopClip. Beta releases are more frequent and let you get early access to new
features and fixes. Please report any bugs you find.

:::tip Beta access for <SetappInline><AaLink cfg="setapp.referralUrl">Setapp</AaLink></SetappInline> customers

Setapp users may download these betas, but they will run in trial mode. For
long-term testing, selected betas are also published to Setapp. To receive them,
enable beta updates option in Setapp settings.

:::

## Latest Beta

<Download
name="PopClip"
:ver="beta.versionString"
:build="beta.version"
:date="beta.date"
:size="beta.size"
:os="beta.minimumSystemVersion"
:archs="beta.archs"
:url="beta.url"
notes="#beta-version-history"
channel="beta"
/>

**Beta installation:** Install in the Applications folder, replacing any
existing copy of the PopClip app. PopClip beta will preserve your current
settings and extensions.

## Beta Version History

See also: [Production Version History](/changelog)

<div :class="$style.history">
<Changelog channel="beta" />
</div>

<style module>
.history h2 {
  border: none;
  font-size: 1.25em;
}
</style>
