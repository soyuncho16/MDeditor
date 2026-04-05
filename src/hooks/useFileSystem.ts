import { invoke } from "@tauri-apps/api/core";
import { open, confirm } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect } from "react";
import { useEditorStore } from "../stores/editorStore";
import type { FileEntry } from "../types";

export function useFileSystem() {
  const {
    rootPath,
    activeFilePath,
    setRootPath,
    setFileTree,
    setActiveFile,
    markSaved,
  } = useEditorStore();

  const openFolder = useCallback(async () => {
    const selected = await open({ directory: true });
    if (!selected) return;
    const path = selected as string;
    const entries = await invoke<FileEntry[]>("read_directory", { path });
    setRootPath(path, entries);
    await invoke("watch_directory", { path });
  }, [setRootPath]);

  const loadChildren = useCallback(async (dirPath: string): Promise<FileEntry[]> => {
    return invoke<FileEntry[]>("read_directory", { path: dirPath });
  }, []);

  const saveFile = useCallback(async () => {
    if (!activeFilePath) return;
    const currentContent = useEditorStore.getState().content;
    await invoke("write_file", {
      path: activeFilePath,
      content: currentContent,
    });
    markSaved();
  }, [activeFilePath, markSaved]);

  const openFile = useCallback(
    async (filePath: string) => {
      const state = useEditorStore.getState();
      if (state.isDirty) {
        const shouldSave = await confirm(
          "저장하지 않은 변경 사항이 있습니다. 저장하시겠습니까?",
          { title: "저장하시겠습니까?", kind: "warning" },
        );
        if (shouldSave) {
          await saveFile();
        }
      }

      // 바이너리 파일 체크 (간단한 확장자 기반)
      const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
      const textExts = ["md", "txt", "markdown", "mdown", "mkd"];
      if (!textExts.includes(ext)) {
        return; // 텍스트 파일만 열기
      }

      const fileContent = await invoke<string>("read_file", {
        path: filePath,
      });

      // 대용량 파일 경고 (1MB)
      if (fileContent.length > 1_000_000) {
        const shouldOpen = await confirm(
          "이 파일은 1MB 이상입니다. 성능이 저하될 수 있습니다. 열시겠습니까?",
          { title: "대용량 파일", kind: "warning" },
        );
        if (!shouldOpen) return;
      }

      setActiveFile(filePath, fileContent);
    },
    [setActiveFile, saveFile],
  );

  useEffect(() => {
    if (!rootPath) return;
    const unlisten = listen<string[]>("fs-change", async () => {
      const entries = await invoke<FileEntry[]>("read_directory", {
        path: rootPath,
      });
      setFileTree(entries);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [rootPath, setFileTree]);

  return { openFolder, openFile, saveFile, loadChildren };
}
