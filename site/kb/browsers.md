---
aside: false
---

<script setup lang="ts">
import { data } from './browsers.data';
const yes = '✅';
const no = '';
</script>

# Browser support

This table lists all the browsers that PopClip is aware of, and the level of
support provided for each one. (See [Key to table](#key-to-table).)

<table>
<thead>
<tr>
<th>Browser</th>
<th style="text-align: center">Basic</th>
<th style="text-align: center">Page Info</th>
<th style="text-align: center">Address Bar</th>
<th style="text-align: center">Background Tab</th>
<th style="text-align: center">Open In</th>
</tr>
</thead>
<tbody>
<tr v-for="browser in data.browsers">
<td>
  <a v-if="browser.homepageUrl" :href="browser.homepageUrl">{{ browser.name }}</a>
  <span v-else>{{ browser.name }}</span>
  <br><code>{{ browser.bundleId }}</code>
</td>
<td style="text-align: center">{{ browser.supportsAware ? yes : no }}</td>
<td style="text-align: center">{{ browser.supportsPageInfo ? yes : no }}</td>
<td style="text-align: center">{{ browser.supportsAddressBar ? yes : no }}</td>
<td style="text-align: center">{{ browser.supportsBackgroundTab ? yes : no }}</td>
<td style="text-align: center">{{ browser.supportsOpenIn ? yes : no }}</td>
</tr>
</tbody>
</table>

## Key to table

The table contains columns for each of the following features:

- **Basic:** PopClip knows that the app is a browser, and URL-opening actions
  triggered in the app will stay in the same app.

- **Page Info:** PopClip can read the current page URL and/or page title
  alongside the selected text.

- **Address Bar:** This column indicates if PopClip will pop-up when you
  single-click in the browser's address bar.

- **Background Tab:** This column indicates whether the browser supports
  openening searches and URLs in a background tab by holding down the Shift key.

- **Open In:** This column indicates whether the browser is available as a
  target in the
  [Open in Browser](https://pilotmoon.com/popclip/extensions/page/OpenInBrowser)
  extension.

Apps not on this list will be treated as regular apps. PopClip will pop-up in
the app but will not apply browser-specific features. To suggest additional
browsers please [get in touch](/support).
