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
| `stdin`             | String (optional) | For script specified as `shell script file` only. Set the name of a [script variable](./script-variables) to pass via standard input (stdin). If omitted, no standard input is provided to the script.                                                            |

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

Within the script, access the selected text with the shell variable
`POPCLIP_TEXT`. Many other variables are also available, as listed in
[Script variables](./script-variables.md).

Optionally, the script may read from standard input (stdin). If the `stdin`
field is set, the script will receive the contents of the specified variable via
stdin. For example, if `stdin` is set to `text`, the script will receive the
contents of the `POPCLIP_TEXT` variable via stdin.

Any text returned by the script via standard output (stdout) will be available
to the `after` step.

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

### Example package

The
[Say](https://github.com/pilotmoon/PopClip-Extensions/tree/master/source/Say.popclipext)
extension demonstrates a packaged shell script extension.

### Example snippets

::: info About these examples

The examples are given using the [inverted syntax](./snippets#inverted-syntax).

:::

Examples of passing the selected text to the `say` command to be spoken aloud:

::: code-group

```zsh [Using shell variable]
#!/bin/zsh
# #popclip
# name: Say (variable)
say $POPCLIP_TEXT
```

```zsh [Using stdin]
#!/bin/zsh
# #popclip
# name: Say (stdin)
# stdin: text
say
```

```zsh [With voice option]
#!/bin/zsh
# #popclip
# name: Say (option)
# stdin: text
# options: 
# - { identifier: voice, type: string, label: Voice, defaultValue: Daniel }
say -v $POPCLIP_OPTION_VOICE
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

A more substantial script (thanks to [Will B Chang](https://forum.popclip.app/t/new-snippet-azure-text-to-speech/1790)):

```zsh
#!/bin/zsh
# Text-to-speech in PopClip using Azure Cognitive Services
#
# #popclip
# name: Azure TTS
# icon: symbol:message.and.waveform

# Please apply for your own key <https://portal.azure.com/>
AZURE_REGION=
AZURE_SUBSCRIPTION_KEY=

# Create a temporary audio file
temp_audio_file=$(mktemp)

# Use curl to download and save the audio data to the temporary file
curl -X POST "https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1" \
     -H "Ocp-Apim-Subscription-Key: ${AZURE_SUBSCRIPTION_KEY}" \
     -H "Content-Type: application/ssml+xml" \
     -H "X-Microsoft-OutputFormat: audio-16khz-32kbitrate-mono-mp3" \
     -d "<speak version=\"1.0\" xmlns=\"http://www.w3.org/2001/10/synthesis\" xml:lang=\"en-US\">
    <voice name=\"en-US-JennyMultilingualNeural\">
        $POPCLIP_TEXT
    </voice>
</speak>" -so "$temp_audio_file"

# Play the temporary audio file using afplay
afplay "$temp_audio_file"

# Clean up the temporary audio file when you're done with it
rm "$temp_audio_file"
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
