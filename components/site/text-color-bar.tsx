"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bold, Eraser } from "lucide-react";

const PRESETS = ["#ffffff", "#111111", "#c0272d", "#ffb3a8", "#fbbf24", "#4b8f6b", "#1877f2", "#6b7280"];
const BAR_WIDTH = 360;

/**
 * Floating colour / bold bar shown above whichever rich text (`[data-rich]`) is being edited. Styles the
 * selected words, or the whole text when nothing is selected, using inline `<span style="color/font-weight">`.
 */
export const TextColorBar = (): React.JSX.Element | null => {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const saved = useRef<Range | null>(null);

  useEffect(() => {
    const inBar = (el: EventTarget | null): boolean => !!(el as HTMLElement | null)?.closest?.("[data-color-bar]");
    const richOf = (el: EventTarget | null): HTMLElement | null =>
      ((el as HTMLElement | null)?.closest?.("[data-rich]") as HTMLElement | null) ?? null;

    const onFocusIn = (e: FocusEvent): void => {
      const rich = richOf(e.target);
      if (rich) setTarget(rich);
      else if (!inBar(e.target)) setTarget(null);
    };
    const onMouseDown = (e: MouseEvent): void => {
      if (!inBar(e.target) && !richOf(e.target)) setTarget(null);
    };
    const onSelection = (): void => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const host = richOf(range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement);
        if (host) saved.current = range.cloneRange();
      }
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("selectionchange", onSelection);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("selectionchange", onSelection);
    };
  }, []);

  useEffect(() => {
    if (!target) return;
    const update = (): void => {
      if (!target.isConnected) setTarget(null);
      else setRect(target.getBoundingClientRect());
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [target]);

  const run = (command: "foreColor" | "removeFormat" | "bold", value?: string): void => {
    if (!target) return;
    target.focus();
    const sel = window.getSelection();
    if (sel && saved.current && target.contains(saved.current.commonAncestorContainer)) {
      sel.removeAllRanges();
      sel.addRange(saved.current);
    }
    // Nothing selected → colour the whole text.
    if (!sel || sel.isCollapsed || !target.contains(sel.anchorNode)) document.execCommand("selectAll");
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, value);
  };

  if (!target || !rect) return null;
  const left = Math.min(Math.max(rect.left, 8), window.innerWidth - BAR_WIDTH - 8);
  const top = rect.top > 56 ? rect.top - 46 : rect.bottom + 6;

  return createPortal(
    <div
      data-color-bar
      style={{ left, top, width: BAR_WIDTH }}
      className="fixed z-[80] flex items-center gap-1.5 rounded-lg border bg-card p-1.5 text-foreground shadow-lg"
    >
      <button
        type="button"
        title="In đậm (bật / tắt)"
        // mousedown default would move focus out of the text and lose the selection
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => run("bold")}
        className="grid size-6 cursor-pointer place-items-center rounded border hover:bg-accent"
      >
        <Bold className="size-3.5" />
      </button>
      <span className="px-1 text-xs font-medium text-muted-foreground">Màu</span>
      {PRESETS.map((c) => (
        <button
          key={c}
          type="button"
          title={c}
          // mousedown default would move focus out of the text and lose the selection
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => run("foreColor", c)}
          className="size-5 cursor-pointer rounded-full border"
          style={{ background: c }}
        />
      ))}
      <input
        type="color"
        title="Chọn màu khác"
        defaultValue="#c0272d"
        onChange={(e) => run("foreColor", e.target.value)}
        className="h-6 w-7 cursor-pointer rounded border bg-transparent p-0"
      />
      <button
        type="button"
        title="Xoá định dạng (về mặc định)"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => run("removeFormat")}
        className="grid size-6 cursor-pointer place-items-center rounded border hover:bg-accent"
      >
        <Eraser className="size-3.5" />
      </button>
    </div>,
    document.body,
  );
};
