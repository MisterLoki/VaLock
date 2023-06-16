// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde_json::{json, Value};
use std::fs::{self, File, OpenOptions};
use std::io::{Read, Seek, SeekFrom, Write};
use std::path::PathBuf;

mod api;
mod errors;

fn get_config_dir() -> PathBuf {
    let mut dir: PathBuf = tauri::api::path::data_dir().unwrap();
    dir.push("VaLock");
    if !dir.exists() {
        let _ = fs::create_dir_all(&dir);
    }
    dir.push("config.json");
    dir
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_agents() -> Result<Vec<api::Agent>, errors::MyErr> {
    Ok(api::get_agents()?)
}

#[tauri::command]
fn get_maps() -> Result<Vec<api::Map>, errors::MyErr> {
    Ok(api::get_maps()?)
}

#[tauri::command]
fn get_config() -> Result<Value, errors::MyErr> {
    let mut file = File::open(get_config_dir())?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;

    let data: Value = serde_json::from_str(&contents)?;

    Ok(data)
}

#[tauri::command]
fn set_agent_for_all_maps(name: String) -> Result<(), errors::MyErr> {
    let maps = api::get_maps()?;
    let mut data = json!({});
    for map in maps {
        data[map.name] = json!(name);
    }
    let mut file = File::create(get_config_dir())?;
    file.write_all(data.to_string().as_bytes())?;
    Ok(())
}

#[tauri::command]
fn set_agent_for_map(agent: String, map: String) -> Result<(), errors::MyErr> {
    let mut config = get_config()?;

    config[map] = Value::String(agent);

    let json_string = serde_json::to_string(&config)?;

    let mut file = OpenOptions::new()
        .write(true)
        .truncate(true)
        .open(get_config_dir())?;

    file.seek(SeekFrom::Start(0))?;
    file.write_all(json_string.as_bytes())?;
    file.sync_all()?;

    Ok(())
}

#[tauri::command]
fn start() {
    
}

fn main() {
    if !get_config_dir().exists() {
        match File::create(get_config_dir()) {
            Ok(mut file) => match file.write_all(json!({}).to_string().as_bytes()) {
                Ok(_) => {}
                Err(_) => {
                    return;
                }
            },
            Err(_) => {
                return;
            }
        }
    }
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_agents,
            get_maps,
            get_config,
            set_agent_for_all_maps,
            set_agent_for_map,
            start
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
