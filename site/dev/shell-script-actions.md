# Shell Script actions

A Shell Script action runs a shell script, either directly or from a file. The
script can be written in any language that can be executed from the command line,
such as Bash, Python, Ruby, Perl, etc.

## Properties

A Shell Script action is defined by the presence of either a `shell script` or
`shell script file` field, as follows:

| Key                 | Type              | Description                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shell script`      | String            | A string to be run as a shell script. The string will be passed via standard input to the specified `interpreter`, invoked without arguments.                                                                                                                                                                                                                                 |
| `shell script file` | String            | The name of a file in the extension's package directory. See below for more details.                                                                                                                                                                                                                                                                                          |
| `interpreter`       | String (optional) | Specify the interpreter to use for `shell script` or `shell script file`. You can specify a bare executable name, for example `ruby`, and PopClip will look for it in the `PATH` of the user's default shell. Alternatively, you can specify an absolute path such as `/bin/zsh`. If omitted, PopClip will directly execute the script file instead, if possible (see below). |
| `stdin`             | String (optional) | Name of a field whose value should be passed to the script via standard input (see [Script Fields](#script-fields)). For example, `text` to pass the matched text (same as `$POPCLIP_TEXT` variable). If omitted, no standard input is provided to the script.                                                                                                                |

The `shell script file` will be executed as follows:

- If an `interpreter` is specified, then PopClip will call this interpreter with
  the script file path as argument.
- Otherwise, if the script file has executable permissions set (with `chmod +x`)
  and the first line of the file starts with `#!`, then PopClip will execute the
  file directly.
- Otherwise, if the extension has a `popclip version` and it is set to a value
  less than `4035`, or if the script file name ends with `.sh`, the script will
  be executed with `/bin/sh`. (This behaviour is for backward compatibility with
  existing extensions.)
- If none of the above conditions are met, the extension will fail to load
  because no interpreter has been specified.

The the current working directory will be set to the package directory. Within
the script, access the selected text as `$POPCLIP_TEXT`, and other variables as
described in [Script Fields](#script-fields). You can output a string to the
standard output and have PopClip act upon it by defining an `after` key. For
returning errors, see [Indicating Errors](#indicating-errors).

## Examples

Here is a simple example shell script (this one is for 'Say'):

```sh
#!/bin/sh
echo "$POPCLIP_TEXT" | say  # pipe text to 'say' command
```

A shell script can return a string back to PopClip via stdout. For example:

```sh
#!/bin/zsh
echo -n "Hello, ${POPCLIP_TEXT}!"  # echo to stdout, no newline at end
```

The same in Python:

```python
#!/usr/bin/env python3
import os
print('Hello, ' + os.environ['POPCLIP_TEXT'] + '!', end='')
```

In Ruby:

```ruby
#!/usr/bin/env ruby
print 'Hello, ' + ENV['POPCLIP_TEXT'] + ', from Ruby'
```

## Shell Script Testing

While developing a script, you can test it from the command line by setting the
required variables in the call. For example:

```bash
POPCLIP_TEXT="my test text" POPCLIP_OPTION_FOO="foo" ./myscript
```

Or export them before calling the script:

```bash
export POPCLIP_TEXT="my test text"
export POPCLIP_OPTION_FOO="foo"
./myscript
```
