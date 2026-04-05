import { useState, useCallback, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { AppLayout } from "./components/layout/AppLayout";
import { FileTree } from "./components/sidebar/FileTree";
import { MarkdownEditor } from "./components/editor/MarkdownEditor";
import { MarkdownPreview } from "./components/preview/MarkdownPreview";
import { useFileSystem } from "./hooks/useFileSystem";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useEditorStore } from "./stores/editorStore";
import "./App.css";

function App() {
  const { openFolder, openFile, saveFile, loadChildren } = useFileSystem();
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);

  const handleCursorChange = useCallback((line: number, col: number) => {
    setCursorLine(line);
    setCursorCol(col);
  }, []);

  const handleTranslate = useCallback(() => {
    const btn = document.querySelector(
      "[data-translate-button]",
    ) as HTMLButtonElement;
    btn?.click();
  }, []);

  useKeyboardShortcuts({
    onSave: saveFile,
    onOpenFolder: openFolder,
    onTranslate: handleTranslate,
  });

  useEffect(() => {
    const unlisten = listen<string>("open-file", async (event) => {
      const filePath = event.payload;
      if (filePath) {
        try {
          const fileContent = await invoke<string>("read_file", { path: filePath });
          useEditorStore.getState().setActiveFile(filePath, fileContent);
        } catch (err) {
          console.error("파일 열기 실패:", err);
        }
      }
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return (
    <AppLayout
      sidebar={
        <FileTree
          onOpenFolder={openFolder}
          onFileClick={openFile}
          onLoadChildren={loadChildren}
        />
      }
      editor={<MarkdownEditor onCursorChange={handleCursorChange} />}
      preview={<MarkdownPreview />}
      cursorLine={cursorLine}
      cursorCol={cursorCol}
    />
  );
}

export default App;
