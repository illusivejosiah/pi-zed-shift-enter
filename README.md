# pi-zed-shift-enter

Fixes **Shift+Enter** not creating newlines in [pi](https://github.com/badlogic/pi-mono) when running inside [Zed](https://zed.dev)'s built-in terminal.

## Install

```bash
pi install git:github.com/illusivejosiah/pi-zed-shift-enter
```

Or manually copy `extension.ts` to `~/.pi/agent/extensions/zed-shift-enter.ts`.

## Problem

Zed's terminal does not support the [Kitty keyboard protocol](https://sw.kovidgoyal.net/kitty/keyboard-protocol/) ([zed#29756](https://github.com/zed-industries/zed/discussions/29756)). When you press Shift+Enter in pi inside Zed's terminal, it queues a follow-up message instead of inserting a newline.

**Ctrl+J** works as an alternative newline key without this extension.

## Root Cause

| Key | Bytes sent by Zed | Pi interprets as |
|-----|-------------------|-----------------|
| Enter | `\x0d` (CR) | Enter — submit |
| Shift+Enter | `\x1b\x0d` (ESC+CR) | Alt+Enter — follow-up (wrong) |
| Ctrl+J | `\x0a` (LF) | Newline (correct) |

Without Kitty protocol, pi treats the ESC prefix as an Alt modifier, so `ESC+CR` becomes Alt+Enter instead of Shift+Enter.

This extension intercepts `\x1b\x0d` and converts it to `\x0a` (bare LF), which pi's editor recognizes as a newline.

## When is this no longer needed?

This extension becomes unnecessary when either:

- **Zed** implements the Kitty keyboard protocol ([zed#29756](https://github.com/zed-industries/zed/discussions/29756))
- **Pi** adds `\x1b\x0d` as a recognized Shift+Enter variant in the editor's newline detection

## License

MIT
