use notify::{RecommendedWatcher, RecursiveMode, Watcher, EventKind};
use serde::Serialize;
use std::fs;
use std::path::Path;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager};

#[derive(Serialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
}

pub struct WatcherState(pub Mutex<Option<RecommendedWatcher>>);

#[tauri::command]
pub fn read_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let dir = Path::new(&path);
    if !dir.is_dir() {
        return Err(format!("'{}' 는 유효한 디렉토리가 아닙니다", path));
    }

    let mut entries: Vec<FileEntry> = fs::read_dir(dir)
        .map_err(|e| format!("디렉토리 읽기 실패: {}", e))?
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let name = entry.file_name().to_string_lossy().to_string();
            // 숨김 파일 제외
            if name.starts_with('.') {
                return None;
            }
            let path = entry.path().to_string_lossy().to_string();
            let is_dir = entry.file_type().ok()?.is_dir();
            Some(FileEntry { name, path, is_dir })
        })
        .collect();

    // 폴더 먼저, 그 다음 이름순
    entries.sort_by(|a, b| {
        b.is_dir.cmp(&a.is_dir).then(a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    Ok(entries)
}

#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("파일 읽기 실패: {}", e))
}

#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, &content).map_err(|e| format!("파일 저장 실패: {}", e))
}

#[tauri::command]
pub fn watch_directory(app: AppHandle, path: String) -> Result<(), String> {
    let state = app.state::<WatcherState>();
    let app_handle = app.clone();

    let watcher = notify::recommended_watcher(move |res: Result<notify::Event, notify::Error>| {
        if let Ok(event) = res {
            match event.kind {
                EventKind::Create(_) | EventKind::Remove(_) | EventKind::Modify(_) => {
                    let _ = app_handle.emit("fs-change", &event.paths);
                }
                _ => {}
            }
        }
    })
    .map_err(|e| format!("감시 시작 실패: {}", e))?;

    let mut guard = state.0.lock().map_err(|e| format!("락 실패: {}", e))?;

    if let Some(mut old_watcher) = guard.take() {
        let _ = old_watcher.unwatch(Path::new(&path));
    }

    let mut watcher = watcher;
    watcher
        .watch(Path::new(&path), RecursiveMode::Recursive)
        .map_err(|e| format!("디렉토리 감시 실패: {}", e))?;

    *guard = Some(watcher);
    Ok(())
}
