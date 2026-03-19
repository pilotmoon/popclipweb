---
outline: deep
---

# Basics

This page will teach you the fundamentals of PopClip: how to get the PopClip bar
to appear and disappear, and control when it can show up.

## Make PopClip appear

### Appear when selecting text

Whenever "Appear automatically" is turned on in settings, PopClip runs in the
background and waits for you to select text with your mouse or trackpad.

**Try it:** Drag the pointer over some text to select it. PopClip will appear
automatically.

![](./media/anim-basic-5.mp4 "PopClip appears when text is selected using the pointer.")

::: info Didn't work?

If PopClip doesn't appear, check the [Troubleshooting](/kb/troubleshooting) page
for help.

:::

PopClip will respond when selecting text by the following methods:

- **Drag the pointer** over the text.
- **Double-click** a word to select it (or double-click and drag).
- **Triple-click** to select a whole line or paragraph (or triple-click and
  drag).
- Click once, then **hold Shift (⇧) and click** elsewhere to select between the
  two points.

PopClip will not appear when selecting text purely with the keyboard, for
example, holding Shift and pressing Arrow keys. In that situation, you can
trigger PopClip with the keyboard shortcut.

### Appear without selecting text

To make PopClip appear _without_ selecting text, you can **long press** the
mouse or trackpad button. PopClip appears after you hold the button for 0.5
seconds.

![](./media/anim-insert-1.mp4 "A long press makes PopClip appear without a a selection.")

For the long press trigger to work, "Appear automatically" must be turned on in
settings.

### Appear with a keyboard shortcut

In PopClip's settings, you can
[set a keyboard shortcut](./settings#keyboard-shortcut) for making PopClip
appear. This works even when "Appear automatically" is turned off.

When activated with the keyboard shortcut, PopClip appears in keyboard control
mode. PopClip's bar will respond to keyboard input as follows:

| Key                   | Action                         |
| --------------------- | ------------------------------ |
| Arrow keys (←→, ↑↓)   | Change the highlighted action  |
| Return (↵), Space bar | Perform the highlighted action |
| Esc key               | Dismiss PopClip                |

![](./media/anim-keyboard-2.mp4 "Selecting actions using the arrow keys and Return.")

### Appear with AppleScript

For integration with other tools, you can also
[make PopClip appear using AppleScript](/kb/applescript).

## Make PopClip disappear

After PopClip appears it will stay on screen until you select an action. You can
make it disappear without selecting an action by doing one of the following:

- **Click anywhere** outside the PopClip bar.
- **Press any key**: PopClip will disappear and the key you pressed will be sent
  to the app underneath. (Note: in keyboard control mode, some keys will perform
  actions within PopClip.)
- **Move the pointer** away from the PopClip bar.
- **Scroll** with the mouse wheel or trackpad.

## Prevent PopClip appearing

Sometimes, you might want to prevent PopClip from appearing automatically. There
are a few ways to do this:

- **Disable auto-appear completely**, by turning off "Appear automatically" in
  settings.

- **Disable auto-appear in a particular application or website**, by adding a
  [rule](./settings.md#excluded-apps-pane) in PopClip settings.

- To suppress PopClip temporarily, **Hold down the Command (⌘) key** while
  selecting text with the mouse or trackpad.
