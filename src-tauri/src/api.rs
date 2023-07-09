use std::io::Write;
use std::path::PathBuf;
use std::fs::{self, File};
use reqwest::{self};
use serde::{Deserialize, Serialize};
use serde_json::{self, Value};

use unzip;

use crate::errors;


#[derive(Debug, Serialize, Deserialize)]
pub struct Agent {
    name: String,
    icon: String,
    full_portrait: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Map {
    pub name: String,
    full_portrait: String,
}

pub fn get_agents() -> Result<Vec<Agent>, errors::MyErr> {
    let resp = reqwest::blocking::get("https://valorant-api.com/v1/agents")?.text()?;
    let data: Value = serde_json::from_str(&resp)?;

    let agents = data["data"].as_array().unwrap();

    let mut result: Vec<Agent> = vec![];

    for agent in agents {
        result.push(Agent {
            name: agent
                .get("displayName")
                .unwrap()
                .to_string()
                .replace("\"", ""),
            icon: agent
                .get("displayIcon")
                .unwrap()
                .to_string()
                .replace("\"", ""),
            full_portrait: agent
                .get("fullPortrait")
                .unwrap()
                .to_string()
                .replace("\"", ""),
        });
    }
    result.retain(|item| item.full_portrait != "null");
    result.dedup_by_key( |a| a.name.clone());
    Ok(result)
}

pub fn get_maps() -> Result<Vec<Map>, errors::MyErr> {
    let resp = reqwest::blocking::get("https://valorant-api.com/v1/maps")?.text()?;
    let data: Value = serde_json::from_str(&resp)?;
    
    let agents = data["data"].as_array().unwrap();
    
    let mut result: Vec<Map> = vec![];
    
    for agent in agents {
        result.push(Map {
            name: agent
            .get("displayName")
                .unwrap()
                .to_string()
                .replace("\"", ""),
            full_portrait: agent.get("splash").unwrap().to_string().replace("\"", ""),
        });
    }
    
    result.retain(|item| item.name != "The Range");
    result.dedup_by_key(|a| a.name.clone());

    Ok(result)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Version {
    pub version: i32,
    pub update_message: String,
}

pub struct VersionCheckResult {
    pub need_update: bool,
    pub update_message: String
}

fn get_version() -> i32 {
    return 1;
}

pub fn need_version_update() -> Result<VersionCheckResult, errors::MyErr> {    
    let resp: Version = reqwest::blocking::get("https://raw.githubusercontent.com/mahdigholami099/VaLock/main/version")?.json::<Version>()?;

    if resp.version == get_version() {
        return Ok(VersionCheckResult {need_update: false, update_message: "".to_string()});
    }
    else {
        return Ok(VersionCheckResult {need_update: true, update_message: resp.update_message});
    }
}

pub fn prepare_python_code(mut path_to_save: PathBuf) -> Result<(), errors::MyErr> {
    path_to_save.push("main.py");
    let mut file: File = File::create(path_to_save)?;
    file.write_all(&reqwest::blocking::get(format!("https://raw.githubusercontent.com/mahdigholami099/VaLock/main/python/{}/main.py", get_version()))?.bytes()?)?;
    Ok(())
}

pub fn prepare_start_bat(mut path_to_save: PathBuf) -> Result<(), errors::MyErr> {
    path_to_save.push("start.bat");
    let mut file: File = File::create(path_to_save)?;
    file.write_all(&reqwest::blocking::get(format!("https://raw.githubusercontent.com/mahdigholami099/VaLock/main/python/{}/start.bat", get_version()))?.bytes()?)?;
    Ok(())
}

pub fn download_python(path_to_save: PathBuf) -> Result<(), errors::MyErr> {
    let archive = path_to_save.clone().join("py.zip");
    let mut file: File = File::create(&archive)?;
    file.write_all(&reqwest::blocking::get(format!("https://github.com/mahdigholami099/VaLock/raw/main/python/{}/py.zip", get_version()))?.bytes()?)?;

    unzip::Unzipper::new(File::open(&archive)?, path_to_save).unzip()?;

    fs::remove_file(archive)?;
    Ok(())
}