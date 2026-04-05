import { useEffect } from "react";
import { useEditorStore } from "../stores/editorStore";

interface ShortcutHandlers {
  onSave: () => void;
  onOpenFolder: () => void;
  onTranslate: () => void;
}

export function useKeyboardShortcuts({
  onSave,
  onOpenFolder,
  onTranslate,
}: ShortcutHandlers) {
  const { toggleSidebar, togglePreview } = useEditorStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === "s") {
        e.preventDefault();
        onSave();
      } else if (ctrl && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      } else if (ctrl && e.shiftKey && e.key === "P") {
        e.preventDefault();
        togglePreview();
      } else if (ctrl && e.key === "o") {
        e.preventDefault();
        onOpenFolder();
      } else if (ctrl && e.key === "t") {
        e.preventDefault();
        onTranslate();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSave, onOpenFolder, onTranslate, toggleSidebar, togglePreview]);
}
