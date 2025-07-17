# AppleScript interface

PopClip has an AppleScript interface that allows you to control PopClip from Automator workflows and other automation software.

## Overview

### **Properties**

- **enabled**: Whether PopClip is on or off (Boolean).

### **Commands**

- **appear**: Activate PopClip now for the currently selected text in the foreground app.

## Examples

To turn PopClip on or off, use the "enabled" property. For example:

```applescript
tell application "PopClip" to set enabled to true          -- turn on
tell application "PopClip" to set enabled to false         -- turn off
tell application "PopClip" to set enabled to not enabled   -- toggle
```

To make PopClip appear for the currently selected text, use the "appear" command:

```applescript
tell application "PopClip" to appear
```

Notes:

- You can still trigger "appear" while PopClip is turned off.

- When activated via AppleScript, the PopClip bar will be in [keyboard mode](/guide/basics#activate-with-a-keyboard-shortcut).
