import { useState, useCallback } from "react";
import { useEditorStore } from "../../stores/editorStore";
import type { FileEntry } from "../../types";
import styles from "./FileTree.module.css";

interface FileTreeItemProps {
  entry: FileEntry;
  depth: number;
  onFileClick: (path: string) => void;
  onLoadChildren: (path: string) => Promise<FileEntry[]>;
}

export function FileTreeItem({
  entry,
  depth,
  onFileClick,
  onLoadChildren,
}: FileTreeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const activeFilePath = useEditorStore((s) => s.activeFilePath);

  const handleClick = useCallback(async () => {
    if (entry.is_dir) {
      if (!expanded && children.length === 0) {
        setLoading(true);
        const loaded = await onLoadChildren(entry.path);
        setChildren(loaded);
        setLoading(false);
      }
      setExpanded(!expanded);
    } else {
      onFileClick(entry.path);
    }
  }, [entry, expanded, children.length, onFileClick, onLoadChildren]);

  const isActive = entry.path === activeFilePath;

  return (
    <div>
      <div
        className={`${styles.item} ${isActive ? styles.active : ""}`}
        style={{ paddingLeft: depth * 16 + 8 }}
        onClick={handleClick}
      >
        <span className={styles.icon}>
          {entry.is_dir ? (expanded ? "\u{1F4C2}" : "\u{1F4C1}") : "\u{1F4C4}"}
        </span>
        <span className={styles.name}>{entry.name}</span>
        {loading && <span className={styles.loading}>...</span>}
      </div>
      {expanded &&
        children.map((child) => (
          <FileTreeItem
            key={child.path}
            entry={child}
            depth={depth + 1}
            onFileClick={onFileClick}
            onLoadChildren={onLoadChildren}
          />
        ))}
    </div>
  );
}
