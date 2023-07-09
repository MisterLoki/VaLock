use reqwest;
use serde_json;
use std::io;


#[derive(Debug)]
pub enum MyErr {
    ReqwestErr(reqwest::Error),
    SerdeErr(serde_json::Error),
    IOErr(io::Error),
    DuplicateErr(),
    CustomError(String)
}

impl From<reqwest::Error> for MyErr {
    fn from(err: reqwest::Error) -> Self {
        MyErr::ReqwestErr(err)
    }
}

impl From<serde_json::Error> for MyErr {
    fn from(err: serde_json::Error) -> Self {
        MyErr::SerdeErr(err)
    }
}

impl From<io::Error> for MyErr {
    fn from(err: io::Error) -> Self {
        MyErr::IOErr(err)
    }
}

impl std::fmt::Display for MyErr {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MyErr::SerdeErr(err) => write!(f, "{}", err),
            MyErr::ReqwestErr(err) => write!(f, "{}", err),
            MyErr::IOErr(err) => write!(f, "{}", err),
            MyErr::DuplicateErr() => write!(f, "Already Exist."),
            MyErr::CustomError(err) => write!(f, "{}", err),
        }
    }
}

impl serde::Serialize for MyErr {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}