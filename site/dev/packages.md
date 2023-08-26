# Package format

A PopClip extension package bundles together all the files needed for an extension in a folder.

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
   _Signature.plist             -- Signature (official Pilotmoon extensions only)
   Config.plist                 -- Main configuration file
   say.sh                       -- Script file
   speechicon.png               -- Icon file
```

### Zipped `.popclipextz` files

For distribution, an extension package folder may be zipped and renamed with the
extension `.popclipextz`. You can examine an existing PopClip extension by
renaming it with a `.zip` extension and unzipping it, to reveal a `.popclipext`
package.

## The Config file

Every extension must define a configuration dictionary. This can be provided in
a file called either `Config.plist`, `Config.yaml`, `Config.json`, or
`Config.js`.

| Format     | File Name      | Description                                                                              |
| ---------- | -------------- | ---------------------------------------------------------------------------------------- |
| plist      | `Config.plist` | An Apple [XML Property List](https://en.wikipedia.org/wiki/Property_list) (Plist) file.  |
| YAML       | `Config.yaml`  | A [YAML 1.2](https://yaml.org) file ([quickref](https://quickref.me/yaml)).              |
| JSON       | `Config.json`  | A [JSON](https://www.json.org/json-en.html) file ([quickref](https://quickref.me/json)). |
| JavaScript | `Config.js`    | A JavaScript source file exporting an object. (See #TODO).                               |

The Config file must define a single dictionary at its root, which defines the
extension. Although the three formats are different, they all can be used to
define a dictionary mapping string keys to values. The values can be strings,
numbers, booleans, arrays or other dictionaries. (In this documentation the term
'field' is used to refer to a key/value pair in a dictionary.)

The choice of format does not affect the extension functionality in any way, so
you can choose whichever format you prefer to work with. (Plist was the original
config file format for PopClip extensions for many years, and the JSON and YAML
formats were added later.)
