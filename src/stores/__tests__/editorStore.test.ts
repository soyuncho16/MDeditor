import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "../editorStore";

describe("editorStore", () => {
  beforeEach(() => {
    useEditorStore.setState(useEditorStore.getInitialState());
  });

  it("초기 상태가 올바르다", () => {
    const state = useEditorStore.getState();
    expect(state.rootPath).toBeNull();
    expect(state.fileTree).toEqual([]);
    expect(state.activeFilePath).toBeNull();
    expect(state.content).toBe("");
    expect(state.isDirty).toBe(false);
    expect(state.sidebarVisible).toBe(true);
    expect(state.previewVisible).toBe(true);
  });

  it("setContent: 내용 변경 시 isDirty가 true가 된다", () => {
    const store = useEditorStore.getState();
    store.setContent("# Hello");
    const updated = useEditorStore.getState();
    expect(updated.content).toBe("# Hello");
    expect(updated.isDirty).toBe(true);
  });

  it("setActiveFile: 파일 전환 시 content와 isDirty가 리셋된다", () => {
    const store = useEditorStore.getState();
    store.setContent("dirty content");
    store.setActiveFile("/path/to/file.md", "# New File");
    const updated = useEditorStore.getState();
    expect(updated.activeFilePath).toBe("/path/to/file.md");
    expect(updated.content).toBe("# New File");
    expect(updated.isDirty).toBe(false);
  });

  it("markSaved: 저장 후 isDirty가 false가 된다", () => {
    const store = useEditorStore.getState();
    store.setContent("changed");
    expect(useEditorStore.getState().isDirty).toBe(true);
    store.markSaved();
    expect(useEditorStore.getState().isDirty).toBe(false);
  });

  it("toggleSidebar: 사이드바 토글", () => {
    const store = useEditorStore.getState();
    expect(store.sidebarVisible).toBe(true);
    store.toggleSidebar();
    expect(useEditorStore.getState().sidebarVisible).toBe(false);
    store.toggleSidebar();
    expect(useEditorStore.getState().sidebarVisible).toBe(true);
  });

  it("togglePreview: 프리뷰 토글", () => {
    const store = useEditorStore.getState();
    expect(store.previewVisible).toBe(true);
    store.togglePreview();
    expect(useEditorStore.getState().previewVisible).toBe(false);
  });
});
