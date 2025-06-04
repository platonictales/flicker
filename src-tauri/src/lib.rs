// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use std::sync::Mutex;
use std::collections::HashMap;
use once_cell::sync::Lazy;
use dirs::data_dir;
use serde::{Serialize, Deserialize};
use std::fs;

static DB: Lazy<Mutex<HashMap<String, Vec<Block>>>> = Lazy::new(|| Mutex::new(HashMap::new()));

#[derive(Serialize, Deserialize, Clone)]
pub struct Block {
    pub r#type: String,
    pub text: String,
}

#[tauri::command]
fn auto_save_blocks(blocks: Vec<Block>, doc_id: String) -> Result<(), String> {
    // Save to in-memory session
    let mut db = DB.lock().unwrap();
    db.insert(doc_id.clone(), blocks.clone());
    // Also persist to disk (actual DB/file)
    let base_dir = data_dir().ok_or("No app data dir")?;
    let app_dir = base_dir.join("flicker");
    let path = app_dir.join(format!("autosave_{}.json", doc_id));
    println!("Saving to: {:?}", path); // <--- Add here

    let data = serde_json::to_string(&blocks).map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    std::fs::write(path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn generate_unique_doc_id() -> Result<String, String> {
    let base_dir = data_dir().ok_or("No app data dir")?;
    let app_dir = base_dir.join("flicker");
    let prefix = "autosave_screenplay-";
    let ext = ".json";
    let mut max_num = 0;
    if app_dir.exists() {
        if let Ok(entries) = fs::read_dir(&app_dir) {
            for entry in entries.flatten() {
                if let Some(fname) = entry.file_name().to_str() {
                    if fname.starts_with(prefix) && fname.ends_with(ext) {
                        let num_part = &fname[prefix.len()..fname.len()-ext.len()];
                        if let Ok(num) = num_part.parse::<u32>() {
                            if num > max_num {
                                max_num = num;
                            }
                        }
                    }
                }
            }
        }
    }
    let new_id = format!("screenplay-{}", max_num + 1);
    Ok(new_id)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, auto_save_blocks, generate_unique_doc_id])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
