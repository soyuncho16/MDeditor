import { useEffect, useRef, useCallback } from "react";
import type { EditorView } from "@codemirror/view";

interface ScrollSyncOptions {
  editorView: EditorView | null;
  previewEl: HTMLElement | null;
}

/** 스크롤 컨테이너 내 요소의 절대 오프셋을 구한다 (scrollTop 보정 포함) */
function topInContainer(el: HTMLElement, container: HTMLElement): number {
  return el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
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

    /** data-source-line 요소를 정렬된 배열로 캐시 (HTML 변경 시 갱신) */
    function collectSourceElements() {
      const nodeList = previewEl!.querySelectorAll<HTMLElement>("[data-source-line]");
      const result: { el: HTMLElement; line: number }[] = [];
      for (const el of nodeList) {
        const line = parseInt(el.dataset.sourceLine ?? "", 10);
        if (!isNaN(line)) result.push({ el, line });
      }
      result.sort((a, b) => a.line - b.line);
      return result;
    }

    function handleEditorScroll() {
      if (scrollSourceRef.current === "preview") return;
      scrollSourceRef.current = "editor";

      const scrollTop = editorScroller.scrollTop;
      const scrollHeight = editorScroller.scrollHeight - editorScroller.clientHeight;

      if (scrollHeight <= 0) { clearScrollSource(); return; }

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

      // 에디터 화면 상단의 라인 번호
      const topBlock = editorView!.lineBlockAtHeight(scrollTop);
      const topLine = editorView!.state.doc.lineAt(topBlock.from).number;

      const elements = collectSourceElements();
      if (elements.length === 0) {
        // fallback: 비율 동기화
        previewEl!.scrollTop = (scrollTop / scrollHeight) * (previewEl!.scrollHeight - previewEl!.clientHeight);
        clearScrollSource();
        return;
      }

      // topLine 이하인 가장 가까운 요소와 다음 요소를 찾는다
      let curIdx = -1;
      for (let i = elements.length - 1; i >= 0; i--) {
        if (elements[i].line <= topLine) { curIdx = i; break; }
      }

      if (curIdx === -1) {
        // 첫 요소보다 위에 있음
        previewEl!.scrollTop = 0;
        clearScrollSource();
        return;
      }

      const cur = elements[curIdx];
      const curTop = topInContainer(cur.el, previewEl!);

      if (curIdx + 1 < elements.length) {
        const next = elements[curIdx + 1];
        const nextTop = topInContainer(next.el, previewEl!);
        const lineRange = next.line - cur.line;
        const fraction = lineRange > 0 ? (topLine - cur.line) / lineRange : 0;
        previewEl!.scrollTop = curTop + (nextTop - curTop) * Math.max(0, Math.min(1, fraction));
      } else {
        previewEl!.scrollTop = curTop;
      }

      clearScrollSource();
    }

    function handlePreviewScroll() {
      if (scrollSourceRef.current === "editor") return;
      scrollSourceRef.current = "preview";

      const scrollTop = previewEl!.scrollTop;
      const scrollHeight = previewEl!.scrollHeight - previewEl!.clientHeight;

      if (scrollHeight <= 0) { clearScrollSource(); return; }

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

      const elements = collectSourceElements();
      if (elements.length === 0) {
        editorScroller.scrollTop = (scrollTop / scrollHeight) * (editorScroller.scrollHeight - editorScroller.clientHeight);
        clearScrollSource();
        return;
      }

      // 프리뷰 스크롤 위치에 해당하는 요소를 찾는다
      let curIdx = -1;
      for (let i = elements.length - 1; i >= 0; i--) {
        const elTop = topInContainer(elements[i].el, previewEl!);
        if (elTop <= scrollTop + 5) { curIdx = i; break; }
      }

      if (curIdx === -1) {
        editorScroller.scrollTop = 0;
        clearScrollSource();
        return;
      }

      const cur = elements[curIdx];
      const curTop = topInContainer(cur.el, previewEl!);
      let targetLine = cur.line;

      if (curIdx + 1 < elements.length) {
        const next = elements[curIdx + 1];
        const nextTop = topInContainer(next.el, previewEl!);
        const elRange = nextTop - curTop;
        if (elRange > 0) {
          const fraction = (scrollTop - curTop) / elRange;
          targetLine = cur.line + (next.line - cur.line) * Math.max(0, Math.min(1, fraction));
        }
      }

      // 에디터를 해당 라인으로 스크롤
      const lineNum = Math.max(1, Math.min(Math.round(targetLine), editorView!.state.doc.lines));
      const lineInfo = editorView!.state.doc.line(lineNum);
      const lineBlock = editorView!.lineBlockAt(lineInfo.from);
      editorScroller.scrollTop = lineBlock.top;

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
