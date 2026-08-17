---
title: Submit an Extension
titleTemplate: ":title — PopClip Extensions"
layout: doc
sidebar: false
aside: true
prev: false
next: false
editLink: false
lastUpdated: false
---

<div style="color: var(--vp-c-text-2); margin-bottom: 32px;">
<a href="/extensions/" style="text-decoration: none;">← PopClip Extensions Directory</a>
</div>

# Submit an Extension

Extensions are submitted from **public GitHub repositories**.

First you will need to publish your extension in a public GitHub repository, if you have not done so already.
Then, configure your repository using the instructions below.

The directory automatically reads your extension source files each time you publish a git tag.
It only does this once for each tag, so any change you want to make to the published extension
requires a new tag.

The directory stores copies of the source files and processes them. It will extract metadata
from the Config file and sign and zip the extension.

## Submission agreement

By submitting an extension, you agree to the following. If you don't agree, please don't submit.

- **You keep your copyright.** Your extension remains yours. Nothing here
  transfers ownership of it to me.
- **It's yours to submit.** You wrote the extension, or you otherwise have the
  right to submit it and to give the permissions below.
- **Permission to distribute.** You give me permission, without payment, to store
  your submitted files, to package and sign them, to distribute the result
  through this directory and through PopClip's update mechanism, and to show your
  extension's name, description, icon, readme, author credit, and other content on
  this website and in the PopClip app.
- **Permission for users.** You allow anyone to download and use your extension.
  If you include a license file, that license governs whatever
  else people may do with your code.
- **You are responsible for it.** Be prepared to be contacted by other PopClip users via GitHub about bugs, feature requests, etc.
  Be aware that things may break. For example, a third-party service may change its API, or a macOS update or PopClip update may break something.
- **Do no harm.** It goes without saying that your extension must absolutely respect
  the user and must never do anything to harm the user or their computer.
  Respect their privacy, too: if your extension sends the selected text, or any
  other data, to you or to a third-party service, say so plainly in your readme. Never
  collect or transmit anything the user wouldn't expect.
- **Publication is at my discretion.** I decide what gets published and what
  appears on the front page, and I may unpublish anything at any time.
- **Withdrawal.** [Contact me](/support) if you want your extension unpublished.
  Copies already installed by users are unaffected.
- **No guarantees.** I provide this directory free of charge and as-is, with no
  promise of availability.

## 1. Prepare your extension

### Package

Your extension should be a [`.popclipext` package](/dev/packages) within your repository.

You can include multiple extensions in one repository.
Example structure:

```
 MyGitHubRepository/
  ∟ LICENSE
  ∟ popclip-directory.yaml
  ∟ source/
     ∟ MyExtension.popclipext/
        ∟ Config.ts
     ∟ MyOtherExtension.popclipext/
        ∟ Config.yaml

```

Do not submit a zipped `.popclipextz` file — it will not work.

::: warning Paths must not change
After you submit an extension for the first time, its source repo and path must not change.
If you rename a package folder or move it within the repo, your next submission will fail.
:::

### Required fields

Your extension's Config **must** contain all of the following, or it will be rejected automatically:

- `name` — the extension name.
- `identifier` — a unique identifier string. This is the primary identifier for your extension
  in the directory and it can never be changed.
- `description` — a concise description to be shown in the directory. Typically one sentence.
- `popclipVersion` — the minimum required PopClip version as an integer, e.g. `5115`.
  Normally the version you tested against, but you can set an older version if you want to support older PopClip versions
  and you are sure your extension will be compatible.

### Limits

- No more than **100 files** per extension.
- No single file larger than **1 MiB**.
- No more than **2 MiB** in total.

### Readme and demo

You can enhance your directory listing with an optional readme file and demo video ([example](https://www.popclip.app/extensions/x/fwrfay)):

- A Markdown `readme.md` file (any capitalisation) in the root of the package folder is picked up
  automatically and shown on the extension's page.

- A `demo.mp4` or `demo.gif` in the root of the package folder is shown as a looping demo video.

To keep the final file size down, readme and demo files are automatically excluded from the zipped extension that users download.

::: tip Images in readme
The readme can include inline images. For example, in markdown: `![](_screenshot1.png)`

Image files must be contained inside the package itself -- externally hosted images are not allowed and will be scrubbed. Use an underscore name prefix to [hide](#hidden-files) images and keep them out of the final downloadable zip.
:::

### Keywords

The directory's search box matches against your extension's **name** and
the names of any associated apps — but **not** its
description. If there are other words people might search for, add a
`keywords` field to your Config:

```yaml
keywords: quotation marks curly smart
```

The `keywords` field is one plain string, not an array: just words separated by
spaces. Matching is case-insensitive.

### Changelog

I encourage you to include a changelog to let users know what has changed in each version. Put it at the foot of your readme. Suggested format:

```markdown
## Changelog

- 2026-08-14: Added support for xyz.
- 2026-07-02: Initial release.
```

### Hidden files

Any file or folder whose name starts with `.` or `_` is automatically excluded
from the final packaged extension.

### Credits

The directory will automatically credit you as the extension's author and maintainer by linking to your repository
and GitHub user page. Put any additional acknowledgements in your readme.

### License

Add a `LICENSE` file in your repository root if you want a licence shown.
GitHub detects it and the directory displays the license name
(such as "MIT License") and a link to the license text.

## 2. Install the GitHub app

Install the **[PopClip Directory GitHub app](https://github.com/apps/popclip-directory)** on the
repository (or repositories) you want to submit from.

You can install it on all your repositories or select individual ones. It makes
no difference: a repository takes part only if it contains the configuration file
described below, so the app can sit harmlessly on repositories that have nothing
to do with PopClip.

The app asks for **read access to code**, so it can fetch your extension's files,
and **read and write access to checks**, so it can report results on your commits.
It cannot modify your code.

## 3. Add a configuration file

Create a file called **`popclip-directory.yaml`** in the root of your repository.
Its presence is what opts the repository in. Example:

```yaml
include: "source/*.popclipext"
versionPrefix: v
```

The keys are:

- **`include`** (required) — one or more paths or glob patterns matching your
  extension package folders. Use `.` if the repository root _is_ the package.
- **`exclude`** (optional) — patterns to ignore.
- **`versionPrefix`** (optional) — a prefix your tags use, e.g. `v`. It's
  stripped off to get the version number, and tags without it are ignored.

Example of multiple patterns, skipping an excluded extension:

```yaml
include:
  - "*.popclipext"
  - "extras/*.popclipext"
exclude: "MySecretExtension.popclipext"
versionPrefix: v
```

In patterns, `*` matches within a single path segment and `**` matches across
segments — so `experimental/*` covers that folder's immediate contents, while
`experimental/**` covers everything beneath it at any depth. (The pattern engine is [picomatch](https://github.com/micromatch/picomatch) with default settings.)

## 4. Tag a version and push

Version numbers are one to four non-negative integers separated by dots, with no
leading zeros.

- Valid: `1`, `1.6`, `5076.95.0`
- Not valid: `1.00`, `1.7-beta2`

Each new version must be higher than the last one you submitted.

Tag the release and push the tag along with your branch:

```bash
git tag v1.2
git push origin main v1.2
```

Or publish a release through the GitHub website, which creates the tag for you.

::: tip Tag tips
Tags can be annotated or lightweight, it does not matter.
Make sure to push both the commit itself and the tag. If in doubt, `git push && git push --tags` usually does the trick!
:::

## 5. Watch for the result

Within a few seconds a check named **Submission Check** appears on the tagged
commit, and completes with a summary of what happened to each package.

![](./media/shot-gh-check-successful.png "The submission result is posted to the GitHub commit.")

You'll also get a **comment on the commit** — and an email, if you have GitHub email notifications enabled for commit comments:

- **Received** — your extension passed the automated checks and is queued for
  review.
- **Could not be processed** — something failed validation. The comment says
  what was wrong. Fix it and push a new tag.
- **Published** — your extension is live, with a link to its page.

## 6. Review and publication

Submissions aren't published automatically — each one is reviewed by hand.

Once published, your extension gets a page of its own and becomes downloadable as a signed `.popclipextz` file.

Your **author page** lists everything you've contributed and is yours to share:

```
https://www.popclip.app/extensions/authors/your-github-username
```

Extensions on your author page are not listed on the directory's front page right
away. The index is curated: extensions are added to it selectively. A well-named, thoughtfully-designed extension,
with a good icon, a clear open-source licence and a helpful readme makes that more likely, but there are no guarantees. Your
author page link works either way, so you can share your extension immediately.

**Please note: I choose which extensions to put on the front page at my sole discretion. Please do not contact me requesting your extension to be added.**

All published extensions (whether included on the front page or not) are eligible for automatic updates within the PopClip app.
Updates are subject to the same review as initial submissions.

## Troubleshooting

- The GitHub repository must be **public**.
- The [PopClip Directory app](https://github.com/apps/popclip-directory) must be installed on that repository.
- `popclip-directory.yaml` must be in the repository **root** of the tagged
  commit, and its `include` patterns must actually match your package folders.
- The tag must match your `versionPrefix`, if you set one.
- You must actually push the tag to GitHub as well as the commit.
