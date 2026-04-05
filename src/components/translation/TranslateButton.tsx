import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { confirm } from "@tauri-apps/plugin-dialog";
import { useEditorStore } from "../../stores/editorStore";
import {
  checkOllamaStatus,
  translateWithOllama,
} from "../../lib/translation";
import { OllamaSetupGuide } from "./OllamaSetupGuide";

export function TranslateButton() {
  const { t } = useTranslation();
  const { content, isDirty, isTranslating, setContent, setIsTranslating } =
    useEditorStore();
  const [showGuide, setShowGuide] = useState(false);
  const [model, setModel] = useState("gemma3:4b");
  const abortRef = useRef<AbortController | null>(null);

  const handleTranslate = useCallback(async () => {
    // 미저장 확인
    if (isDirty) {
      const shouldContinue = await confirm(
        t("dialog.translateConfirmMessage"),
        { title: t("dialog.translateConfirmTitle"), kind: "warning" },
      );
      if (!shouldContinue) return;
    }

    // Ollama 연결 확인
    const status = await checkOllamaStatus();
    if (!status.connected || status.models.length === 0) {
      setShowGuide(true);
      return;
    }

    // 소스 언어 자동 감지 (간단한 휴리스틱)
    const hasChinese = /[\u4e00-\u9fff]/.test(content);
    const sourceLang = hasChinese ? "zh" : "en";

    setIsTranslating(true);
    abortRef.current = new AbortController();

    try {
      const translated = await translateWithOllama(
        content,
        sourceLang,
        model,
        abortRef.current.signal,
      );
      setContent(translated);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("번역 오류:", err);
      }
    } finally {
      setIsTranslating(false);
      abortRef.current = null;
    }
  }, [content, isDirty, model, setContent, setIsTranslating, t]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return (
    <>
      {isTranslating ? (
        <button
          onClick={handleCancel}
          style={{
            background: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: 4,
            padding: "2px 8px",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          {t("translation.cancel")}
        </button>
      ) : (
        <button
          data-translate-button
          onClick={handleTranslate}
          disabled={!content}
          style={{
            background: "none",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
            padding: "2px 8px",
            cursor: content ? "pointer" : "default",
            fontSize: 12,
            opacity: content ? 1 : 0.5,
          }}
        >
          {t("translation.button")}
        </button>
      )}

      {showGuide && (
        <OllamaSetupGuide
          onClose={() => setShowGuide(false)}
          onModelSelect={setModel}
          selectedModel={model}
        />
      )}
    </>
  );
}
