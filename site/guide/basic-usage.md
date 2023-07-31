---
outline: deep
---

# Basic Usage

This section will teach you the fundamentals of PopClip: how to get the PopClip bar to appear and disappear, and a tour of the built-in actions.

## Making PopClip appear

### Select text with the mouse or trackpad

PopClip runs in the background and waits for you to select text with your mouse or trackpad.

**Try it:** Drag the pointer over some text to select it. PopClip will appear automatically.

![](./anim-basic-5.mp4 "PopClip appears when text is selected using the pointer.")

:::tip Didn't work?
If PopClip doesn't appear, check the [Troubleshooting](/kb/troubleshooting) page for help.
:::

PopClip will respond when selecting text by the following methods:

- **Drag the pointer** over the text.
- **Double-click** a word to select it.
- **Triple-click** to select a whole paragraph.
- Click once, then **hold Shift (⇧) and click** elsewhere to select between the two points.
  
When you select text using the keyboard only, such as by holding Shift and using the arrow keys, PopClip will not appear automatically. Use the [keyboard shortcut](#keyboard-shortcut) to make PopClip appear.

### Long press with the mouse or trackpad

To make PopClip appear without selecting text, you can **long press** the mouse or trackpad button. PopClip appears after you hold the button for 0.5 seconds.

![](./anim-insert-1.mp4 "A long press makes PopClip appear without a a selection.")

### Keyboard shortcut

In PopClip's [settings](./settings), you can set a keyboard shortcut for making PopClip appear.

When activated with the keyboard shortcut, PopClip appears in keyboard control mode. PopClip's bar will respond to keyboard input as follows:

|Key|Action|
|-|-|
|Arrow keys (←→, ↑↓)|Change the highlighted action|
|Return (↵), Space bar|Perform the highlighted action|
|Esc key|Dismiss PopClip|

![](./anim-keyboard-2.mp4 "Selecting actions using the arrow keys and Return.")

:::tip Works always!
PopClip's keyboard shortcut works even when PopClip is turned off, or disabled in the current app.
:::

### AppleScript

For integration with other tools, you can make PopClip appear using an AppleScript command. See the [AppleScript]() page for details.

## Making PopClip disappear

After PopClip appears it will stay on screen until you select an action. You can make it disappear without selecting an action by doing one of the following:

- **Click anywhere** outside the PopClip bar.
- **Press any key**: PopClip will disappear and the key you pressed will be sent to the app underneath. (Note: in keyboard control mode, some keys will perform actions within PopClip.)
- **Move the pointer** away from the PopClip bar.
- **Scroll** with the mouse wheel or trackpad.

<!-- 
::: tip Turning off auto-appear
You can turn off PopClip in the settings, either globally or just for specific apps. While disabled, PopClip won't pop-up automatically, but you can still make it appear by pressing the keyboard shortcut.
::: -->

<!-- ## **How does PopClip work?**

PopClip runs in the background and waits for you to select text in another app. PopClip will appear automatically when you select text with your mouse, and can also be made to appear by pressing a [keyboard shortcut]().

When PopClip appears, it will show a menu of actions that you can perform on the selected text. It is context-sensitive, meaning that the actions that appear are dependent on the text you select. For example, actions that operate on URLs will only appear when the text you select contains a URL.

PopClip works in most apps but there are some [apps that PopClip is not compatible with](). -->
