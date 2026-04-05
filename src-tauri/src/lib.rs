mod commands;

use commands::WatcherState;
use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(WatcherState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            commands::read_directory,
            commands::read_file,
            commands::write_file,
            commands::watch_directory,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
