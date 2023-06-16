use reqwest::{self};
use serde::{Deserialize, Serialize};
use serde_json::{self, Value};

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
