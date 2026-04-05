import { create } from "zustand";
import type { FileEntry } from "../types";

interface EditorState {
  rootPath: string | null;
  fileTree: FileEntry[];
  activeFilePath: string | null;
  content: string;
  isDirty: boolean;
  sidebarVisible: boolean;
  sidebarWidth: number;
  previewVisible: boolean;
  isTranslating: boolean;

  setRootPath: (path: string, tree: FileEntry[]) => void;
  setFileTree: (tree: FileEntry[]) => void;
  setActiveFile: (path: string, content: string) => void;
  setContent: (content: string) => void;
  markSaved: () => void;
  toggleSidebar: () => void;
  togglePreview: () => void;
  setSidebarWidth: (width: number) => void;
  setIsTranslating: (value: boolean) => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  rootPath: null,
  fileTree: [],
  activeFilePath: null,
  content: "",
  isDirty: false,
  sidebarVisible: true,
  sidebarWidth: 250,
  previewVisible: true,
  isTranslating: false,

  setRootPath: (path, tree) => set({ rootPath: path, fileTree: tree }),
  setFileTree: (tree) => set({ fileTree: tree }),
  setActiveFile: (path, content) =>
    set({ activeFilePath: path, content, isDirty: false }),
  setContent: (content) => set({ content, isDirty: true }),
  markSaved: () => set({ isDirty: false }),
  toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),
  togglePreview: () => set((s) => ({ previewVisible: !s.previewVisible })),
  setSidebarWidth: (width) => set({ sidebarWidth: width }),
  setIsTranslating: (value) => set({ isTranslating: value }),
}));
