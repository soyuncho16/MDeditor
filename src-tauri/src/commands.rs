use serde::Serialize;

#[derive(Serialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
}

#[tauri::command]
pub fn read_directory(_path: String) -> Result<Vec<FileEntry>, String> {
    Ok(vec![])
}

#[tauri::command]
pub fn read_file(_path: String) -> Result<String, String> {
    Ok(String::new())
}

#[tauri::command]
pub fn write_file(_path: String, _content: String) -> Result<(), String> {
    Ok(())
}
