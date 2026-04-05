import { useTranslation } from "react-i18next";
import { useEditorStore } from "../../stores/editorStore";
import { FileTreeItem } from "./FileTreeItem";
import type { FileEntry } from "../../types";
import styles from "./FileTree.module.css";

interface FileTreeProps {
  onOpenFolder: () => void;
  onFileClick: (path: string) => void;
  onLoadChildren: (path: string) => Promise<FileEntry[]>;
}

export function FileTree({
  onOpenFolder,
  onFileClick,
  onLoadChildren,
}: FileTreeProps) {
  const { t } = useTranslation();
  const { rootPath, fileTree } = useEditorStore();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.openButton} onClick={onOpenFolder}>
          {t("sidebar.openFolder")}
        </button>
      </div>
      {rootPath && fileTree.length === 0 && (
        <div className={styles.empty}>{t("sidebar.emptyFolder")}</div>
      )}
      <div className={styles.tree}>
        {fileTree.map((entry) => (
          <FileTreeItem
            key={entry.path}
            entry={entry}
            depth={0}
            onFileClick={onFileClick}
            onLoadChildren={onLoadChildren}
          />
        ))}
      </div>
    </div>
  );
}
