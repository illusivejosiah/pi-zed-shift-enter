/**
 * pi-zed-shift-enter
 *
 * Fixes Shift+Enter not creating newlines in pi when running inside
 * Zed's built-in terminal, including through tmux.
 *
 * Root cause: Zed's terminal does not support the Kitty keyboard protocol.
 * It sends ESC+CR (\x1b\x0d) for Shift+Enter, which pi misinterprets as
 * Alt+Enter (queue follow-up message) instead of Shift+Enter (new line).
 *
 * Inside tmux with extended-keys-format csi-u, tmux re-encodes \x1b\x0d
 * as \x1b[13;3u (Alt+Enter in CSI-u format) before pi sees it. This
 * extension intercepts both forms.
 *
 * Upstream references:
 * - Zed Kitty protocol: https://github.com/zed-industries/zed/discussions/29756
 * - Zed Shift+Enter fix: https://github.com/zed-industries/zed/issues/33858
 * - Pi terminal setup: https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/terminal-setup.md
 */

import { CustomEditor, type ExtensionAPI } from "@mariozechner/pi-coding-agent";

class ZedFixEditor extends CustomEditor {
  handleInput(data: string): void {
    // Zed sends \x1b\x0d (ESC+CR) for Shift+Enter.
    // Without tmux: arrives as \x1b\r (raw)
    // With tmux (extended-keys csi-u): re-encoded as \x1b[13;3u (Alt+Enter CSI-u)
    // Both must be intercepted before CustomEditor's keybinding loop
    // catches them as Alt+Enter (follow-up).
    if (data === "\x1b\r" || data === "\x1b[13;3u") {
      super.handleInput("\n");
      return;
    }
    super.handleInput(data);
  }
}

export default function (pi: ExtensionAPI) {
  pi.on("session_start", (_event, ctx) => {
    ctx.ui.setEditorComponent((tui, theme, kb) => new ZedFixEditor(tui, theme, kb));
  });
}
