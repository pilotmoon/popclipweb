---
outline: deep
titleTemplate: :title — PopClip Developer
---

# Packages

A PopClip extension package bundles together all the files needed for an
extension in a folder.

## The package folder

A PopClip extension package consists of a config file plus (optional) additional
files such as icons and scripts, all contained in a directory whose name ends
with `.popclipext`.

When you double-click a `.popclipext` package, macOS will open it with PopClip,
which will attempt to load and install it.

::: tip Viewing package contents

macOS treats `.popclipext`directories as packages. To view the contents of a
package, right-click it in Finder and choose Show Package Contents.

:::

Here is an example package structure, the
[Say](https://github.com/pilotmoon/PopClip-Extensions/tree/master/source/Say.popclipext)
extension:

```
Say.popclipext/                -- Package folder
│
├── Config.json                -- Config file
├── README.md                  -- Readme file
├── say.zsh                    -- Script file
└── speechicon.png             -- Icon file
```

### Zipped `.popclipextz` files

For distribution, an extension package folder may be zipped and renamed with the
extension `.popclipextz`. You can examine an existing PopClip extension by
renaming it with a `.zip` extension and unzipping it, to reveal a `.popclipext`
package.

## The Config file

Every package must include a [config dictionary](./config.md). PopClip will try
looking in the root of the package directory for a file with base name `Config`
(case sensitive). The file is interpreted according to its extension:

| File Name                                 | Format                 | Interpretation                                                                  |
| ----------------------------------------- | ---------------------- | ------------------------------------------------------------------------------- |
| `Config.plist`                            | Plist                  | An Apple [XML Property List](https://en.wikipedia.org/wiki/Property_list) file. |
| `Config.json`                             | JSON                   | A [JSON](https://www.json.org/json-en.html) file.                               |
| `Config.yaml`                             | YAML                   | A [YAML 1.2](https://yaml.org) file.                                            |
| `Config.js`, `Config.ts`                  | JavaScript, TypeScript | [JavaScript or TypeScript module](./js-modules.md).                             |
| `Config.<anything else>` or just `Config` | Snippet                | Interpreted as [snippet](./snippets).                                           |

::: info Historical note

Plist was the original format for PopClip extensions, and many of the older
extensions in <AaLink href="https://github.com/pilotmoon/PopClip-Extensions" />
are in Plist format. I recommend avoiding Plist for new extensions, as it is
verbose and harder to read and edit than JSON or YAML.

:::

## Other files

Apart from the config file, an extension package may contain any number of other
files. You are free to name these however you like, except for the reserved
names `Config[.*]` and `_Signature.plist`. You can also use subfolders to
organise your files.

## Examples

For a whole bunch of example extension packages,
see&#32;<AaLink href="https://github.com/pilotmoon/PopClip-Extensions/tree/master/source" />.
