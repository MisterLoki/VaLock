// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::fs::{self, File, OpenOptions};
use std::io::{Read, Seek, SeekFrom, Write};
use std::path::PathBuf;

use tokio::task;
use std::process::Command;

mod api;
mod errors;

fn get_data_dir() -> PathBuf {
    let mut dir: PathBuf = tauri::api::path::data_dir().unwrap();
    dir.push("VaLock");
    if !dir.exists() {
        let _ = fs::create_dir_all(&dir);
    }
    dir
}

fn get_active_profile_dir() -> PathBuf {
    let mut dir: PathBuf = get_data_dir();
    dir.push("active");
    dir
}

fn get_profiles_dir() -> PathBuf {
    let mut dir: PathBuf = get_data_dir();
    dir.push("profiles");
    dir
}

#[tauri::command]
fn get_active_profile() -> String {
    let dir: PathBuf = get_active_profile_dir();
    if dir.exists() {
        return fs::read_to_string(dir).expect("default");
    }
    "default".to_string()
}

fn get_config_dir() -> PathBuf {
    let mut dir: PathBuf = get_profiles_dir();
    dir.push(get_active_profile());
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

#[derive(Debug, Serialize, Deserialize)]
struct Profile {
    name: String,
    full_portrait: String,
}

#[tauri::command]
fn add_profile(name: String) -> Result<(), errors::MyErr> {
    let mut dir = get_profiles_dir();
    dir.push(name);
    if dir.exists() {
        return Err(errors::MyErr::DuplicateErr());
    }
    let mut file = File::create(dir)?;
    file.write_all(json!({}).to_string().as_bytes())?;
    Ok(())
}

#[tauri::command]
fn delete_profile(name: String) -> Result<(), errors::MyErr> {
    let mut dir = get_profiles_dir();
    dir.push(&name);
    println!("{:?}", &dir);
    println!("{:?}", &name);
    fs::remove_file(dir)?;
    Ok(())
}

#[tauri::command]
fn get_profiles() -> Result<Vec<String>, errors::MyErr> {
    let dir = get_profiles_dir();
    let entries = fs::read_dir(dir)?;
    let profiles: Vec<String> = entries
        .filter_map(|entry| {
            if let Ok(entry) = entry {
                entry.file_name().to_str().map(String::from)
            } else {
                None
            }
        })
        .collect();
    Ok(profiles)
}

#[tauri::command]
fn set_active_profile(name: String) -> Result<(), errors::MyErr> {
    let dir = get_active_profile_dir();
    let mut data = File::create(dir)?;
    data.write_all(name.as_bytes())?;
    Ok(())
}

#[tauri::command]
fn start() -> Result<(), errors::MyErr> {
    let main_py = get_data_dir().join("main.py");
    let python = get_data_dir().join("py").join("python.exe");

    Command::new(python).arg(main_py).spawn()?;

    Ok(())
}

#[tauri::command]
async fn install_dependenies() -> Result<(), errors::MyErr> {

    let result = task::spawn_blocking(|| api::prepare_python_code(get_data_dir())).await;
    match result {
        Ok(_) => {}
        Err(error) => {
            return Err(errors::MyErr::CustomError(error.to_string()));
        }
    }

    let result = task::spawn_blocking(|| api::prepare_start_bat(get_data_dir())).await;
    match result {
        Ok(_) => {}
        Err(error) => {
            return Err(errors::MyErr::CustomError(error.to_string()));
        }
    }

    let result = task::spawn_blocking(|| api::download_python(get_data_dir())).await;
    match result {
        Ok(_) => {}
        Err(error) => {
            return Err(errors::MyErr::CustomError(error.to_string()));
        }
    }

    Ok(())
}

fn main() {
    if !get_config_dir().exists() {
        match fs::create_dir_all(get_profiles_dir()) {
            Ok(_) => {}
            Err(_) => {
                return;
            }
        }
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
            add_profile,
            set_active_profile,
            get_profiles,
            get_active_profile,
            delete_profile,
            install_dependenies,
            start
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
