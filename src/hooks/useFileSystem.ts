import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect } from "react";
import { useEditorStore } from "../stores/editorStore";
import type { FileEntry } from "../types";

export function useFileSystem() {
  const {
    rootPath,
    activeFilePath,
    content,
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

  const openFile = useCallback(
    async (filePath: string) => {
      const fileContent = await invoke<string>("read_file", {
        path: filePath,
      });
      setActiveFile(filePath, fileContent);
    },
    [setActiveFile],
  );

  const saveFile = useCallback(async () => {
    if (!activeFilePath) return;
    await invoke("write_file", {
      path: activeFilePath,
      content,
    });
    markSaved();
  }, [activeFilePath, content, markSaved]);

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
