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

/// Opens a GitHub release page only after validating the exact repository prefix.
#[cfg(not(target_os = "android"))]
#[tauri::command]
fn open_external(url: String) -> Result<(), String> {
    let allowed = "https://github.com/MEZTKING/blockloom/releases/";
    if !url.starts_with(allowed) {
        return Err("Only Blockloom release pages can be opened.".into());
    }
    open::that(url).map_err(|error| format!("Could not open the release page: {error}"))
}

#[cfg(target_os = "android")]
#[tauri::command]
fn open_external(_url: String) -> Result<(), String> {
    Err("Open the release page in a browser to update on Android.".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![save_file, open_external])
        .run(tauri::generate_context!())
        .expect("error while running Blockloom");
}
