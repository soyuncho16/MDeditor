import { AppLayout } from "./components/layout/AppLayout";
import { FileTree } from "./components/sidebar/FileTree";
import { useFileSystem } from "./hooks/useFileSystem";
import "./App.css";

function App() {
  const { openFolder, openFile, loadChildren } = useFileSystem();

  return (
    <AppLayout
      sidebar={
        <FileTree
          onOpenFolder={openFolder}
          onFileClick={openFile}
          onLoadChildren={loadChildren}
        />
      }
      editor={<div style={{ padding: 12 }}>에디터 (구현 예정)</div>}
      preview={<div style={{ padding: 12 }}>프리뷰 (구현 예정)</div>}
    />
  );
}

export default App;
