# Shell Script actions

A Shell Script action runs a shell script, either directly or from a file. The
script can be written in any language that can be executed from the command
line, such as Bash, Python, Ruby, Perl, etc.

## Properties

A Shell Script action is defined by the presence of either a `shell script` or
`shell script file` field, as follows:

| Key                 | Type              | Description                                                                                                                                                                                                                                                                       |
| ------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shell script`      | String            | A string to be run as a shell script. The string will be passed via standard input to the specified `interpreter`, invoked without arguments.                                                                                                                                     |
| `shell script file` | String            | The name of a file in the extension's package directory. See [Shell script file execution](#shell-script-file-execution) for more details.                                                                                                                                        |
| `interpreter`       | String (optional) | Specify the interpreter to use for `shell script` or `shell script file`. You can specify a bare executable name, for example `ruby`, and PopClip will look for it in the `PATH` of the user's default shell. Alternatively, you can specify an absolute path such as `/bin/zsh`. |
| `stdin`             | String (optional) | For script specified as `shell script file` only. Set to `text` to pass the contents of `POPCLIP_TEXT` variable via standard input. If omitted, no standard input is provided to the script.                                                                                             |

### Shell script file execution

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

The the current working directory will be set to the package directory.

## Input and output

Within the script, access the selected text as `$POPCLIP_TEXT`, and other
variables as described in [Script fields](./script-fields.md).

Any text returned by the script via `stdout` will be available to the `after`
step.

## Indicating errors

Shell scripts may indicate success or specific failures by the use of exit
codes:

| Result                                                                   | Exit code |
| ------------------------------------------------------------------------ | --------- |
| Success                                                                  | `0`       |
| General error<br>(PopClip will display 'X')                              | `1`       |
| Error with user's settings<br>(PopClip will show the extension settings) | `2`       |

Any other exit code will be treated as a general error.

## Examples

::: info About these examples

The examples are given using the
[inverted snippet syntax](./snippets#inverted-syntax).

:::

Example of passing the selected text to the `say` command to be spoken aloud:

::: code-group

```zsh [Using variable]
#!/bin/zsh
# #popclip
# name: Say (variable)
echo "$POPCLIP_TEXT" | say
```

```zsh [Using stdin]
#!/bin/zsh
# #popclip
# name: Say (stdin)
# stdin: text
say
```

:::

Some examples of returning a string back to PopClip via stdout, in different
languages:

::: code-group

```zsh
#!/bin/zsh
# #popclip
# name: Helloworld in zsh
# after: show-result
echo -n "Hello, ${POPCLIP_TEXT}!"  # `-n` for no newline at end
```

```python
#!/usr/bin/env python3
# #popclip
# name: Helloworld in python
# after: show-result
import os
print('Hello, ' + os.environ['POPCLIP_TEXT'] + '!', end='')
# `end=''` for no newline at end
```

```ruby
#!/usr/bin/env ruby
# #popclip
# name: Helloworld in ruby
# after: show-result
print 'Hello, ' + ENV['POPCLIP_TEXT'] + '!'
```

```perl
#!/usr/bin/env perl
# #popclip
# name: Helloworld in perl
# after: show-result
print "Hello, $ENV{'POPCLIP_TEXT'}!\n";
```

```swift
#!/usr/bin/env swift
// #popclip
// name: Helloworld in swift
// after: show-result
import Foundation
let text = ProcessInfo.processInfo.environment["POPCLIP_TEXT"]!
print("Hello, \(text)!")
```

:::

Example with options:

```zsh
#!/bin/zsh
# #popclip
# name: Optional Helloworld
# after: show-result
# options:
# - type: multiple
#   identifier: greeting
#   label: Greeting
#   values:
#   - Hello
#   - Goodbye
echo -n "${POPCLIP_OPTION_GREETING}, ${POPCLIP_TEXT}!"
```

## Script development tips

While developing a script, you can test it from the command line by setting the
required variables in the call. For example:

```zsh
POPCLIP_TEXT="my test text" POPCLIP_OPTION_FOO="foo" ./myscript
```

Or export them before calling the script:

```zsh
export POPCLIP_TEXT="my test text"
export POPCLIP_OPTION_FOO="foo"
./myscript
```
