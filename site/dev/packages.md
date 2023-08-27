# Packages

A PopClip extension package bundles together all the files needed for an
extension in a folder.

## The package folder

A PopClip extension package consists of a configuration file plus (optional)
additional files such as icons and scripts, all contained in a directory whose
name ends with `.popclipext`.

When you double-click a `.popclipext` package, macOS will open it with PopClip,
which will attempt to load and install it.

::: tip Viewing package contents

macOS treats `.popclipext`directories as packages. To view the contents of a
package, right-click it in Finder and choose Show Package Contents.

:::

Here is an example package structure, the 'Say' extension:

```
Say.popclipext                  -- Containing folder
   _Signature.plist             -- Signature (signed extensions only)
   Config.plist                 -- Main configuration file
   say.sh                       -- Script file
   speechicon.png               -- Icon file
```

### Zipped `.popclipextz` files

For distribution, an extension package folder may be zipped and renamed with the
extension `.popclipextz`. You can examine an existing PopClip extension by
renaming it with a `.zip` extension and unzipping it, to reveal a `.popclipext`
package.

## The config file

Every extension must define a [config dictionary](./config.md). PopClip will look for
its config in the following files:

| Format                                            | File Name           | Description                                                                              |
| ------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------- |
| Plist                                             | `Config.plist`      | An Apple [XML Property List](https://en.wikipedia.org/wiki/Property_list) file.          |
| JSON                                              | `Config.json`       | A [JSON](https://www.json.org/json-en.html) file ([quickref](https://quickref.me/json)). |
| YAML                                              | `Config.yaml`       | A [YAML 1.2](https://yaml.org) file ([quickref](https://quickref.me/yaml)).              |
| JavaScript                                        | `Config.js`         | A JavaScript source file exporting an object. (See #TODO).                               |

If multiple config files are present, PopClip will add the contents of each file
to the config dictionary in the order listed above.

::: info Historical note

Plist was the original format for PopClip extensions. Support for YAML, JSON,
and JavaScript was added later.

:::
