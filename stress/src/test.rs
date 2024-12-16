use crate::models::{TestResults, Wallet};
use crate::utils::{generate_hash, RpcClient};
use dotenv::dotenv;
use ethers::providers::Middleware;
use ethers::{
    providers::{Http, Provider},
    types::{Address, U256},
};
use serde_json::json;
use std::{
    error::Error,
    fs::File,
    io::BufReader,
    str::FromStr,
    sync::Arc,
    time::{SystemTime, UNIX_EPOCH},
};

pub struct MultiWalletTPSTest {
    target_tps: usize,
    wallets: Vec<Wallet>,
    results: TestResults,
    rpc_client: RpcClient,
    provider: Arc<Provider<Http>>,
}

impl MultiWalletTPSTest {
    pub async fn new(target_tps: usize, file_path: String) -> Result<Self, Box<dyn Error>> {
        println!("Initializing test...");
        dotenv().ok();

        let rpc_api = std::env::var("RPC_API")?;
        let provider = Arc::new(Provider::<Http>::try_from(rpc_api)?);
        let rpc_client = RpcClient::new()?;

        // Read wallets from file
        let file = File::open(file_path)?;
        let reader = BufReader::new(file);
        let wallets: Vec<Wallet> = serde_json::from_reader(reader)?;

        println!("Loaded {} wallets", wallets.len());

        Ok(Self {
            target_tps,
            wallets,
            results: TestResults::default(),
            rpc_client,
            provider,
        })
    }

    pub async fn run_tps_test(&mut self) -> Result<(), Box<dyn Error>> {
        println!("Starting test preparation...");
        let batch_size = 1000;
        let total_transactions = self.target_tps;

        // Fetch initial nonces
        println!("Fetching nonces for all wallets...");
        let mut nonces = Vec::new();
        for wallet in &self.wallets {
            let address = Address::from_str(&wallet.address)?;
            let nonce = self.provider.get_transaction_count(address, None).await?;
            // println!("THE NONCE: {}", nonce);
            nonces.push(nonce);
        }

        println!("Starting transaction sending...");
        self.results.start_time = SystemTime::now();

        // Process transactions in batches
        for i in (0..total_transactions).step_by(batch_size) {
            let mut batch_futures = Vec::new();

            for j in 0..batch_size {
                if i + j >= total_transactions {
                    break;
                }

                let from_wallet = &self.wallets[(i + j) % self.wallets.len()];
                let to_wallet = &self.wallets[(i + j + 1) % self.wallets.len()];
                let nonce = nonces[(i + j) % self.wallets.len()];
                nonces[(i + j) % self.wallets.len()] += U256::from(1);

                let tx_params = json!({
                    "from": from_wallet.address,
                    "to": to_wallet.address,
                    "nonce": format!("0x{:x}", nonce),
                    "value": "0x0",
                    "newHash": generate_hash(),
                    "data": "0x"
                });

                batch_futures.push(self.rpc_client.send_transaction(tx_params));
            }

            // Wait for batch completion
            let results = futures::future::join_all(batch_futures).await;
            for result in results {
                match result {
                    Ok(response) => {
                        if response.get("error").is_some() {
                            self.results.failed += 1;
                            if let Some(error) = response.get("error") {
                                self.results.errors.push(error.to_string());
                            }
                        } else {
                            self.results.successful += 1;
                        }
                    }
                    Err(e) => {
                        self.results.failed += 1;
                        self.results.errors.push(e.to_string());
                    }
                }
            }

            println!("Batch {} completed", (i / batch_size) + 1);
        }

        self.results.end_time = SystemTime::now();
        let duration = self.results.end_time
            .duration_since(self.results.start_time)?
            .as_secs_f64();
        self.results.actual_tps = self.results.successful as f64 / duration;

        // Create new block
        println!("Creating new block...");
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)?
            .as_secs();
        match self.rpc_client.create_block(timestamp).await {
            Ok(_) => println!("Block created successfully"),
            Err(e) => println!("Error creating block: {}", e),
        }

        self.print_results(duration);
        Ok(())
    }

    fn print_results(&self, duration: f64) {
        println!("\n=== Test Results ===");
        println!("Duration: {:.2} seconds", duration);
        println!("Successful: {}", self.results.successful);
        println!("Failed: {}", self.results.failed);
        println!("Actual TPS: {:.2}", self.results.actual_tps);

        if !self.results.errors.is_empty() {
            println!("\nErrors encountered:");
            for (i, error) in self.results.errors.iter().enumerate() {
                println!("{}. {}", i + 1, error);
            }
        }
    }
}