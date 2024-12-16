use reqwest::{Client, ClientBuilder};
use serde_json::{json, Value};
use std::env;
use std::error::Error;
use std::time::Duration;

pub struct RpcClient {
    client: Client,
    rpc_url: String,
}

impl RpcClient {
    pub fn new() -> Result<Self, Box<dyn Error>> {
        let rpc_url = env::var("RPC_API")?;
        let client = ClientBuilder::new()
            .timeout(Duration::from_secs(80))
            .build()?;

        Ok(Self { client, rpc_url })
    }

    pub async fn send_transaction(&self, params: Value) -> Result<Value, Box<dyn Error>> {
        let request = json!({
            "jsonrpc": "2.0",
            "method": "eth_sendTx",
            "params": [params],
            "id": 1
        });

        let response = self.client
            .post(&self.rpc_url)
            .json(&request)
            .send()
            .await?;

        Ok(response.json().await?)
    }

    pub async fn create_block(&self, timestamp: u64) -> Result<Value, Box<dyn Error>> {
        let request = json!({
            "jsonrpc": "2.0",
            "method": "miner_createBlock",
            "params": [timestamp],
            "id": 1
        });

        let response = self.client
            .post(&self.rpc_url)
            .json(&request)
            .send()
            .await?;

        Ok(response.json().await?)
    }
}