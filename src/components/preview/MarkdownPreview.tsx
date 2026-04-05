import { useEffect, useRef } from "react";
import mermaid from "mermaid";
import { useEditorStore } from "../../stores/editorStore";
import { useMarkdownParser } from "../../hooks/useMarkdownParser";
import styles from "./MarkdownPreview.module.css";

mermaid.initialize({ startOnLoad: false, theme: "default" });

export function MarkdownPreview() {
  const content = useEditorStore((s) => s.content);
  const html = useMarkdownParser(content);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!previewRef.current) return;

    const mermaidBlocks = previewRef.current.querySelectorAll(
      "code.language-mermaid",
    );

    mermaidBlocks.forEach(async (block, index) => {
      const container = block.parentElement;
      if (!container) return;

      const code = block.textContent ?? "";
      const id = `mermaid-${index}-${Date.now()}`;

      try {
        const { svg } = await mermaid.render(id, code);
        container.outerHTML = `<div class="${styles.mermaid}">${svg}</div>`;
      } catch {
        container.outerHTML = `<div class="${styles.mermaidError}">Mermaid 구문 오류</div>`;
      }
    });
  }, [html]);

  return (
    <div
      ref={previewRef}
      className={styles.preview}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
