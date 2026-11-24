use tauri_plugin_dialog::DialogExt;

/// Saves an export through the native Windows dialog instead of relying on
/// WebView downloads. Returns the chosen path, or None when the user cancels.
#[tauri::command]
async fn save_file(
    app: tauri::AppHandle,
    name: String,
    bytes: Vec<u8>,
) -> Result<Option<String>, String> {
    let selected = app
        .dialog()
        .file()
        .set_title("Save Blockloom export")
        .set_file_name(name)
        .blocking_save_file();

    let Some(file_path) = selected else {
        return Ok(None);
    };

    let path = file_path
        .into_path()
        .map_err(|error| format!("Could not resolve the save path: {error}"))?;
    std::fs::write(&path, bytes)
        .map_err(|error| format!("Could not write the file: {error}"))?;
    Ok(Some(path.display().to_string()))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![save_file])
        .run(tauri::generate_context!())
        .expect("error while running Blockloom");
}
