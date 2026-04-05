import { useCallback, useRef } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { TitleBar } from "./TitleBar";
import { StatusBar } from "./StatusBar";
import styles from "./AppLayout.module.css";

interface AppLayoutProps {
  sidebar: React.ReactNode;
  editor: React.ReactNode;
  preview: React.ReactNode;
  cursorLine?: number;
  cursorCol?: number;
}

export function AppLayout({
  sidebar,
  editor,
  preview,
  cursorLine = 1,
  cursorCol = 1,
}: AppLayoutProps) {
  const { sidebarVisible, sidebarWidth, previewVisible, setSidebarWidth } =
    useEditorStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleSidebarDrag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!isDraggingRef.current) return;
        const containerLeft =
          containerRef.current?.getBoundingClientRect().left ?? 0;
        const newWidth = Math.max(
          150,
          Math.min(500, moveEvent.clientX - containerLeft),
        );
        setSidebarWidth(newWidth);
      };

      const onMouseUp = () => {
        isDraggingRef.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [setSidebarWidth],
  );

  return (
    <div className={styles.container}>
      <TitleBar />
      <div className={styles.main} ref={containerRef}>
        {sidebarVisible && (
          <>
            <div className={styles.sidebar} style={{ width: sidebarWidth }}>
              {sidebar}
            </div>
            <div
              className={styles.resizer}
              onMouseDown={handleSidebarDrag}
            />
          </>
        )}
        <div className={styles.editorPane}>{editor}</div>
        {previewVisible && (
          <>
            <div className={styles.resizer} />
            <div className={styles.previewPane}>{preview}</div>
          </>
        )}
      </div>
      <StatusBar line={cursorLine} col={cursorCol} />
    </div>
  );
}
