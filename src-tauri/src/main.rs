#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    let file_path = std::env::args().nth(1);
    mdeditor_lib::run(file_path);
}
