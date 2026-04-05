import { useState, useCallback } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { FileTree } from "./components/sidebar/FileTree";
import { MarkdownEditor } from "./components/editor/MarkdownEditor";
import { useFileSystem } from "./hooks/useFileSystem";
import "./App.css";

function App() {
  const { openFolder, openFile, loadChildren } = useFileSystem();
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);

  const handleCursorChange = useCallback((line: number, col: number) => {
    setCursorLine(line);
    setCursorCol(col);
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
      preview={<div style={{ padding: 12 }}>프리뷰 (구현 예정)</div>}
      cursorLine={cursorLine}
      cursorCol={cursorCol}
    />
  );
}

export default App;
