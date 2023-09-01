---
outline: deep
---

<script setup lang="ts">
import NewsBox from '/src/NewsBox.vue'
</script>

# Welcome

Welcome to the official website for PopClip.

<NewsBox />

## What is PopClip?

PopClip is a Mac utility tool that pops up with a menu of actions when you
select text on your screen.

![PopClip screenshot](/media/popclip.jpg "Screenshot of PopClip")

PopClip's [actions](/guide/actions) range from simple copy-paste and web
searches to complex tasks such as translating text. Using
[extensions](/guide/extensions), you can add actions to PopClip to adapt it to
your needs. Think of PopClip as a context-aware assistant that provides a set of
tools you can use instantly in any app.

PopClip is available for macOS only. It is a [paid](/buy) app with a
[free trial](/download). It has been in continuous development since 2011.

## :open_book: **Site contents**

This website aims to be a complete resource for PopClip users. It contains all
the documentation for PopClip in one place, with the following sections:

- The **User Guide** is an introduction to PopClip. [Install](/guide/install)
  PopClip and learn the [basic concepts](/guide/basics) of the user interface.
  Take a tour of the [built-in actions](/guide/actions), see how to customize
  the [settings](/guide/settings) and add [extensions](/guide/extensions).

- Vital **App Info** including [download links](/download),
  [purchase information](/buy), [version history](/changelog) and
  [support](/support) details.

- The **Knowledge Base** section, with detailed
  [troubleshooting guide](/kb/troubleshooting) and in-depth articles.

- **Policies** including [license terms](/terms) and [privacy](/privacy) policy.

- A **Developer Reference** section with
  [detailed technical documentation](/dev/) on how to create PopClip extensions.

Finally, there is the [Extensions Directory](/extensions/), a dedicated section
of the site for browsing ready-made extensions to add to PopClip.

## :thinker: Frequently asked questions

_See also [Troubleshooting](/kb/troubleshooting) if you have questions about
technical issues._

- **Is there / will you make a version of PopClip for iPhone or iPad?**
  Unfortunately PopClip would not be possible on iOS, due to the way iOS apps
  work.

- **Is there / will you make a version of PopClip for Windows?** I don't make a
  Windows version of PopClip and I have no plans to do so. There is a similar
  app for Windows called [SnipDo](https://snipdo-app.com/) (formerly
  Pantherbar), which the developer says was was inspired by PopClip. However, I
  have no involvement with that app at all.

- **Can you make the Dictionary action use the macOS pop-up dictionary instead
  of the Dictionary app?** I'd love it to do this, but it is technically not
  possible (as far as I know).

## :earth_africa: Languages and translation

PopClip's user interface is developed in English and is translated into Chinese
(Traditional and Simplified), French, German, Italian, Japanese, Korean,
Brazilian Portuguese, Russian, Slovak, Spanish, and Turkish. These translations
have been produced by a mix of paid translation services and volunteer users.

Users can contribute translations in their own language using the CrowdIn
platform. If you would like to add or suggest changes to translations please go
to:
[Pilotmoon Apps project on CrowdIn](https://crowdin.com/project/pilotmoon-apps).
If your language does not exist in the project, send me an email so I can add
it.

The documentation only available in English.

## :man_juggling: About the developer

PopClip is not made by a large company or even a small team; it's made by one
person. Nick Moore. I'm also the one writing this user guide. I'm from the UK
and my native language is English. To get in touch, see
[Support and Feedback](/support).

[Pilotmoon Software](https://pilotmoon.com/) is the business name under which I
have published my apps. You will see some links and references to
`pilotmoon.com` in various places, and I use the `@pilotmoon` handle on GitHub
and elsewhere.

## :handshake: Acknowledgements

PopClip would not be possible without the work of many other people who have
created open source software and freely shared their work. My thanks to the
following people and projects:

- [Sparkle](https://sparkle-project.org/)
  ([license](https://github.com/sparkle-project/Sparkle/blob/2.x/LICENSE)) by
  Andy Matuschak and the Sparkle project contributors.
- [AquaticPrime](https://github.com/bdrister/AquaticPrime/blob/master/Source/CoreFoundation/AquaticPrime.c)
  (BSD License) by Lucas Newman and other contributors.
- [EMKeyChain](https://github.com/irons/EMKeychain) (MIT license) by Brian
  Amerige of Extendmac, LLC.
- [ShortcutRecorder](https://github.com/Kentzo/ShortcutRecorder) (CC Attribution
  4.0) by Ilya Kulakov and other contributors.
- [nanosvg](https://github.com/memononen/nanosvg) (zlib license) by Mikko
  Mononen.
- [case-anything](https://github.com/mesqueeb/case-anything) (MIT license) by
  Luca Ban.
- [core-js](https://github.com/zloirock/core-js) (MIT license) by Denis
  Pushkarev.
- [axios](https://github.com/axios/axios) (MIT license) by Matt Zabriskie and
  other contributors.
- [js-yaml](https://github.com/nodeca/js-yaml) (MIT license) Vitaly Puzrin and
  other contributors.
- [linkedom](https://github.com/WebReflection/linkedom) (ISC License) by Andrea
  Giammarchi.
- [sanitize-html](https://github.com/apostrophecms/sanitize-html) (MIT license)
  by P'unk Avenue LLC.
- [turndown](https://github.com/mixmark-io/turndown) (MIT license) by Dom
  Christie.
- [Iconify](https://github.com/iconify) by Vjacheslav Trushkin, and the authors
  of the included
  [icon sets](https://github.com/iconify/icon-sets/blob/master/collections.json).

::: info :turtle:&ensp;It's turtles all the way down

This is actually just a small fraction of the open-source libraries in use,
since the above projects recursively include other projects. For space, I've
limited the list to the libraries that I've directly imported and used for core
functionality.

:::
