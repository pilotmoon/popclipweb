<script setup lang="ts">
import DirectoryCount from '/src/DirectoryCount.vue'
import GuideVersionBanner from '/src/GuideVersionBanner.vue'
</script>

# Extensions

<GuideVersionBanner />

Extensions add new actions to PopClip. You can install ready-made extensions and
also create your own.

Configure, re-order and remove extensions in the
[Actions pane](./settings#action-settings).

::: tip Get stuck in!

Browse the [PopClip Extensions Directory](/extensions/) which currently
contains&#x0020;<DirectoryCount /> extensions.

:::

## Installing a downloadable extension

When you download a ready-made extension it will have the file extension
`.popclipextz` or `.popcliptxt`. Simply open the file to add the extension to
PopClip.

![](./media/anim-extension-install-4.mp4 "Installing an extension from the directory")

### Unsigned Extensions

If you see an "Unsigned Extension" warning it means the extension runs code that
has the potential to access files on your machine or access the internet, and is
not from PopClip's developer. You will need to confirm whether you want to
install the extension.

![](./media/shot-unsigned-warning.png#pref "Unsigned extension warning")

::: warning

Beware of extensions from untrusted sources as they can potentially be
malicious.

:::

## Installing a snippet

PopClip can load extensions directly from a special plain text format called a
"snippet". Snippets are useful for creating quick extensions and sharing them as
plain text, without having to create a file. Snippets can be shared in emails,
forums, on websites — anywhere you put plain text.

Here is an example snippet, which defines an action for searching Emojipedia for
the selected text:

```text
#popclip extension to search Emojipedia
name: Emojipedia
icon: search filled E
url: https://emojipedia.org/search/?q=***
```

To install that, you select the text and then click the action _Install
Extension "Emojipedia"_ that appears in the PopClip bar.

![](./media/anim-extension-snippet-2.mp4 "Installing an extension snippet")

:::tip Snippet format

Notice that the first line of the snippet starts with `#popclip`. This is a
special marker that tells PopClip that this is a snippet. For more about
snippets, see [Snippets](/dev/snippets) in the developer reference.

:::

## Creating your own extension

For more about creating both snippets and downloadable extensions, see
[Extensions Developer Reference](/dev/).
