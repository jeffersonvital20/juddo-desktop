// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn emitir_som_tatame(tipo: &str) -> String {
    // Comando nativo para tocar avisos sonoros (Gongo / Fim de luta / Alerta de Osaekomi)
    format!("Som executado: {}", tipo)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![emitir_som_tatame])
        .run(tauri::generate_context!())
        .expect("Erro ao executar a aplicação Judoo Desktop");
}
