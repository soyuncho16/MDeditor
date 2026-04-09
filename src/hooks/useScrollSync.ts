import { useEffect, useRef, useCallback } from "react";
import type { EditorView } from "@codemirror/view";

interface ScrollSyncOptions {
  editorView: EditorView | null;
  previewEl: HTMLElement | null;
}

export function useScrollSync({ editorView, previewEl }: ScrollSyncOptions) {
  const scrollSourceRef = useRef<"editor" | "preview" | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const clearScrollSource = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      scrollSourceRef.current = null;
    }, 80);
  }, []);

  useEffect(() => {
    if (!editorView || !previewEl) return;

    const editorScroller = editorView.scrollDOM;

    function findPreviewElementForLine(line: number): HTMLElement | null {
      const elements = previewEl!.querySelectorAll<HTMLElement>("[data-source-line]");
      let best: HTMLElement | null = null;
      let bestLine = -1;

      for (const el of elements) {
        const elLine = parseInt(el.dataset.sourceLine ?? "", 10);
        if (isNaN(elLine)) continue;
        if (elLine <= line && elLine > bestLine) {
          bestLine = elLine;
          best = el;
        }
      }
      return best;
    }

    function findNextPreviewElement(line: number): { el: HTMLElement; line: number } | null {
      const elements = previewEl!.querySelectorAll<HTMLElement>("[data-source-line]");
      let best: HTMLElement | null = null;
      let bestLine = Infinity;

      for (const el of elements) {
        const elLine = parseInt(el.dataset.sourceLine ?? "", 10);
        if (isNaN(elLine)) continue;
        if (elLine > line && elLine < bestLine) {
          bestLine = elLine;
          best = el;
        }
      }
      return best ? { el: best, line: bestLine } : null;
    }

    function handleEditorScroll() {
      if (scrollSourceRef.current === "preview") return;
      scrollSourceRef.current = "editor";

      const scrollTop = editorScroller.scrollTop;
      const scrollHeight = editorScroller.scrollHeight - editorScroller.clientHeight;

      if (scrollHeight <= 0) return;

      // Edge: top
      if (scrollTop <= 0) {
        previewEl!.scrollTop = 0;
        clearScrollSource();
        return;
      }

      // Edge: bottom
      if (scrollTop >= scrollHeight - 1) {
        previewEl!.scrollTop = previewEl!.scrollHeight - previewEl!.clientHeight;
        clearScrollSource();
        return;
      }

      // Find the top visible line in editor
      const topPos = editorView!.posAtCoords({ x: 0, y: editorView!.documentTop })
        ?? editorView!.viewport.from;
      const topLine = editorView!.state.doc.lineAt(topPos).number;

      const currentEl = findPreviewElementForLine(topLine);
      const nextInfo = findNextPreviewElement(topLine);

      if (!currentEl) {
        // Fallback: ratio-based sync
        const ratio = scrollTop / scrollHeight;
        previewEl!.scrollTop = ratio * (previewEl!.scrollHeight - previewEl!.clientHeight);
        clearScrollSource();
        return;
      }

      const currentElTop = currentEl.offsetTop - previewEl!.offsetTop;

      if (nextInfo) {
        const currentLine = parseInt(currentEl.dataset.sourceLine ?? "1", 10);
        const nextElTop = nextInfo.el.offsetTop - previewEl!.offsetTop;
        const lineFraction = (topLine - currentLine) / (nextInfo.line - currentLine);
        const targetTop = currentElTop + (nextElTop - currentElTop) * Math.max(0, Math.min(1, lineFraction));
        previewEl!.scrollTop = targetTop;
      } else {
        previewEl!.scrollTop = currentElTop;
      }

      clearScrollSource();
    }

    function handlePreviewScroll() {
      if (scrollSourceRef.current === "editor") return;
      scrollSourceRef.current = "preview";

      const scrollTop = previewEl!.scrollTop;
      const scrollHeight = previewEl!.scrollHeight - previewEl!.clientHeight;

      if (scrollHeight <= 0) return;

      // Edge: top
      if (scrollTop <= 0) {
        editorScroller.scrollTop = 0;
        clearScrollSource();
        return;
      }

      // Edge: bottom
      if (scrollTop >= scrollHeight - 1) {
        editorScroller.scrollTop = editorScroller.scrollHeight - editorScroller.clientHeight;
        clearScrollSource();
        return;
      }

      // Find the element at the top of the preview viewport
      const elements = previewEl!.querySelectorAll<HTMLElement>("[data-source-line]");
      let currentEl: HTMLElement | null = null;
      let nextEl: HTMLElement | null = null;

      for (let i = 0; i < elements.length; i++) {
        const elTop = elements[i].offsetTop - previewEl!.offsetTop;
        if (elTop <= scrollTop + 5) {
          currentEl = elements[i];
          nextEl = elements[i + 1] ?? null;
        } else {
          if (!currentEl) {
            currentEl = elements[i];
            nextEl = elements[i + 1] ?? null;
          }
          break;
        }
      }

      if (!currentEl) {
        // Fallback: ratio-based sync
        const ratio = scrollTop / scrollHeight;
        editorScroller.scrollTop = ratio * (editorScroller.scrollHeight - editorScroller.clientHeight);
        clearScrollSource();
        return;
      }

      const currentLine = parseInt(currentEl.dataset.sourceLine ?? "1", 10);

      let targetLine = currentLine;
      if (nextEl) {
        const nextLine = parseInt(nextEl.dataset.sourceLine ?? "1", 10);
        const currentElTop = currentEl.offsetTop - previewEl!.offsetTop;
        const nextElTop = nextEl.offsetTop - previewEl!.offsetTop;
        const elRange = nextElTop - currentElTop;
        if (elRange > 0) {
          const fraction = (scrollTop - currentElTop) / elRange;
          targetLine = currentLine + (nextLine - currentLine) * Math.max(0, Math.min(1, fraction));
        }
      }

      // Scroll editor to the target line
      const lineInfo = editorView!.state.doc.line(
        Math.max(1, Math.min(Math.round(targetLine), editorView!.state.doc.lines)),
      );
      const coords = editorView!.coordsAtPos(lineInfo.from);
      if (coords) {
        const editorTop = editorView!.documentTop;
        editorScroller.scrollTop = coords.top - editorTop;
      }

      clearScrollSource();
    }

    editorScroller.addEventListener("scroll", handleEditorScroll);
    previewEl.addEventListener("scroll", handlePreviewScroll);

    return () => {
      editorScroller.removeEventListener("scroll", handleEditorScroll);
      previewEl!.removeEventListener("scroll", handlePreviewScroll);
      clearTimeout(timerRef.current);
    };
  }, [editorView, previewEl, clearScrollSource]);
}
