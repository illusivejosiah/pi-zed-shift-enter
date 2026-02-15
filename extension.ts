/**
 * pi-zed-shift-enter
 *
 * Fixes Shift+Enter not creating newlines in pi when running inside
 * Zed's built-in terminal.
 *
 * Root cause: Zed's terminal does not support the Kitty keyboard protocol.
 * It sends ESC+CR (\x1b\x0d) for Shift+Enter, which pi misinterprets as
 * Alt+Enter (queue follow-up message) instead of Shift+Enter (new line).
 *
 * This extension intercepts the raw bytes and converts them to bare LF (\x0a),
 * which pi's editor handles as a newline.
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
    // Convert to \x0a (bare LF) which the editor's hardcoded newline check handles.
    if (data === "\x1b\r") {
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
