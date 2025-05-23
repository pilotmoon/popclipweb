<script setup lang="ts">
import PopClipVersion from "../src/PopClipVersion.vue";
</script>

# Migrate from the Mac App Store (MAS) edition to the Standalone edition

The latest version of PopClip is <PopClipVersion />, but it is not available as
an update on the Mac App Store. If you are still using the last released Mac App
Store version, 2023.9, then you can migrate for free to the Standalone edition
to receive the latest updates.

::: info From the developer

I apologise for the inconvenience of having to migrate away from the Mac App
Store. I wrote an explanation for why PopClip left the store in a
[forum post](https://forum.popclip.app/t/popclip-is-leaving-the-mac-app-store/2188).
Thank you for your support and understanding. —Nick Moore, PopClip developer.

:::

## How to migrate

1. Quit the MAS edition of PopClip, if it is running.
2. Use Finder to move the the MAS edition of PopClip from the `/Applications`
   folder to the Trash. (Don't use an app cleaner or uninstaller tool, as that
   will likely delete your settings and extensions.)
3. Download PopClip from the [download](/download) page, and unzip it.
4. Use Finder to move it to the `/Applications` folder.
5. Run the new PopClip app. It will detect your Mac App Store purchase and
   unlock itself.

::: details Alternative: migrate using Homebrew

[Homebrew](https://brew.sh/) users can perform the migration with this command:

```
killall PopClip; brew reinstall popclip --force
```

:::

You can confirm the unlocked status by clicking View License in the About pane
of PopClip's settings menu.

![](./media/shot-mas-license-2.jpg "Standalone edition recognizing the MAS purchase")

## ...I get this weird macOS error though

> The operation can't be completed because some items had to be skipped. For
> each item, choose File > Get Info, make sure "Locked" is deselected, and then
> check the Sharing & Permissions section. When you are sure the items are
> unlocked and not designated as Read Only or No Access, try again.

![](./media/shot-operation-locked-error.jpg "Error message when replacing the PopClip app without deleting the old one first")

This Finder error occurs on macOS Sequoia if you ignore step 2 of the
instructions and try to drag the new app over the existing MAS edition without
deleting it first. To avoid this error message you must manually trash the MAS
edition first.

## ...but I don't have MAS PopClip already installed and it's not available in the store!

![](./media/shot-app-not-available.png#prefs "App not available? No problem, find it in your Account's purchased list.")

Even though PopClip is not searchable in the MAS storefront, it is still part of
your purchased apps list. Install it by going to your account screen in the MAS
and scroll down the Purchased list (it's ordered by purchase date, so you might
have to scroll a long way if you bought it a long time ago).

![](./media/shot-mas-account.jpg "Find PopClip in the Purchased list of your Mac App Store account.")

In case the MAS fails to install PopClip from Purchased list, ensure that there
are no other copies of PopClip anywhere (e.g. in Applications or Downloads
folder), and try again.

After installing PopClip from the MAS, run it once, quit it, and then follow the
steps in [How to migrate](#how-to-migrate) above.

## ...but the App Store is broken on my old version of macOS

The Mac App Store
[currently doesn't work on macOS 10.14 and below](https://mjtsai.com/blog/2025/02/06/mac-app-store-broken-on-macos-10-14-and-earlier/).
Use the free [Legacy OS License key](/download#license-key-for-legacy-macos).

## ...but what about installing in future on a new Mac?

You may be thinking that you have to mess about installing the MAS edition
first, then the Standalone edition, whenever you install PopClip on a new Mac.
Not so!

In future, the Standalone edition will detect a proof your MAS purchase in
iCloud and unlock itself.

This assumes you have iCloud enabled on your Mac now, and you use the same
iCloud account on the new Mac.

## Migration FAQs

- **What happens to my settings and extensions?**<br>Your settings and
  extensions will be preserved when you migrate to the Standalone edition.<br>
  _Important: do not use an app cleaner or uninstaller tool to remove the MAS
  edition! That will likely delete your settings and extensions._

- **How will I get future updates?**<br>After migrating to the Standalone
  edition, you will receive updates automatically through the in-app update
  mechanism. Make sure that "Check for updates" is enabled in PopClip
  preferences.

- **Are there any differences between the MAS and Standalone editions?**
  <br>There are no functional differences between the MAS and Standalone
  editions. They are both built from the exact same codebase. Only the method of
  distribution is different.

- **How can I tell which edition of PopClip I have?**<br>In the PopClip
  preferences window, the About pane shows the edition of PopClip you are using.

- **After migrating, what kind of license do I have exactly?**<br>For MAS
  customers who have migrated to the Standalone edition, I will apply the
  published [update policy](/terms#update-policy). In summary:

  - _Purchased from MAS on or after January 1, 2023:_ This will be treated as
    equivalent to a lifetime license for update purposes.

  - _Purchased from MAS before January 1, 2023:_ I will release free updates at
    my discretion. In the future, I may release an update that requires payment
    from you.

- **Can I buy a new license key for the Standalone edition?**<br>I am currently
  offering all MAS customers a 50% discount on the Lifetime License, which can
  be purchased on the [buy](/buy) page. Please send proof of your MAS purchase
  to my [support email](/support).

![](./media/shot-2024-3-about.png "About pane for PopClip 2024.3, Standalone edition")
