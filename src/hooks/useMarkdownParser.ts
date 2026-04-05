import { useState, useEffect, useRef } from "react";
import { renderMarkdown } from "../lib/markdown";

export function useMarkdownParser(source: string, debounceMs = 300) {
  const [html, setHtml] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const result = await renderMarkdown(source);
      setHtml(result);
    }, debounceMs);

    return () => clearTimeout(timerRef.current);
  }, [source, debounceMs]);

  return html;
}
