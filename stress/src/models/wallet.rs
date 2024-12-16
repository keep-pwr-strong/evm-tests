use serde::Deserialize;

#[derive(Deserialize)]
pub struct Wallet {
    pub address: String,
}