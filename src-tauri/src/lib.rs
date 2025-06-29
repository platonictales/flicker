// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use dirs::data_dir;
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;

static DB: Lazy<Mutex<HashMap<String, Vec<Block>>>> = Lazy::new(|| Mutex::new(HashMap::new()));

#[derive(Serialize, Deserialize, Clone)]
pub struct Block {
    pub r#type: String,
    pub text: String,
}

#[tauri::command]
async fn open_screenplay_file(app: tauri::AppHandle) -> Result<(String, String), String> {
    use std::fs;
    use std::sync::mpsc::channel;

    let (tx, rx) = channel();
    app.dialog().file().pick_file(move |file_path| {
        if let Some(path) = file_path.and_then(|fp| fp.as_path().map(|p| p.to_path_buf())) {
            let path_str = path.display().to_string();
            match fs::read_to_string(&path) {
                Ok(content) => {
                    let _ = tx.send(Ok((path_str, content)));
                }
                Err(e) => {
                    let _ = tx.send(Err(format!("Failed to read file: {}", e)));
                }
            }
        } else {
            let _ = tx.send(Err("No file selected".to_string()));
        }
    });
    rx.recv()
        .unwrap_or_else(|_| Err("Dialog cancelled".to_string()))
}

use serde_json;

#[tauri::command]
async fn save_as_file(app: tauri::AppHandle, content: Vec<Block>) -> Result<String, String> {
    use std::fs;
    use std::sync::mpsc::channel;

    let json_string = serde_json::to_string(&content).map_err(|e| e.to_string())?;

    let (tx, rx) = channel();
    let content_clone = json_string.clone();

    app.dialog()
        .file()
        .set_title("Save screenplay")
        .set_file_name("untitled.json")
        .save_file(move |file_path| {
            if let Some(mut path) = file_path.and_then(|fp| fp.as_path().map(|p| p.to_path_buf())) {
                if path.extension().is_none() || path.extension().unwrap() != "json" {
                    path.set_extension("json");
                }

                match fs::write(&path, &content_clone) {
                    Ok(_) => {
                        let _ = tx.send(Ok(path.display().to_string()));
                    }
                    Err(e) => {
                        let _ = tx.send(Err(format!("Failed to save file: {}", e)));
                    }
                }
            } else {
                let _ = tx.send(Err("No file selected".to_string()));
            }
        });

    tauri::async_runtime::spawn_blocking(move || {
        rx.recv()
            .unwrap_or_else(|_| Err("Dialog cancelled".to_string()))
    })
    .await
    .unwrap_or_else(|e| Err(format!("Task failed: {}", e)))
}

#[tauri::command]
fn auto_save_blocks(
    blocks: Vec<Block>,
    doc_id: String,
    fileLocation: Option<String>,
) -> Result<(), String> {
    // Save to in-memory session
    let mut db = DB.lock().unwrap();
    db.insert(doc_id.clone(), blocks.clone());
    println!("fileLocation: {:?}", fileLocation);
    // Also persist to disk (actual DB/file)
    let base_dir = data_dir().ok_or("No app data dir")?;
    let app_dir = base_dir.join("macguffin");
    let path = if let Some(fp) = fileLocation {
        std::path::PathBuf::from(fp)
    } else {
        std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
        app_dir.join(format!("autosave_{}.json", doc_id))
    };

    let data = serde_json::to_string(&blocks).map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    std::fs::write(path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn generate_unique_doc_id() -> Result<String, String> {
    let base_dir = data_dir().ok_or("No app data dir")?;
    let app_dir = base_dir.join("macguffin");
    let prefix = "autosave_screenplay-";
    let ext = ".json";
    let mut max_num = 0;
    if app_dir.exists() {
        if let Ok(entries) = fs::read_dir(&app_dir) {
            for entry in entries.flatten() {
                if let Some(fname) = entry.file_name().to_str() {
                    if fname.starts_with(prefix) && fname.ends_with(ext) {
                        let num_part = &fname[prefix.len()..fname.len() - ext.len()];
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

#[tauri::command]
fn read_blocks_file(file_path: String) -> Result<String, String> {
    println!("reading from: {:?}", file_path);

    match std::fs::read_to_string(&file_path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read file: {}", e)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Example: allow fullscreen and maximize
            #[cfg(desktop)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.maximize().unwrap();
                window.set_maximizable(true).unwrap();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            auto_save_blocks,
            generate_unique_doc_id,
            open_screenplay_file,
            read_blocks_file,
            save_as_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
