use crate::test::MultiWalletTPSTest;
use std::env;
use std::error::Error;

mod models;
mod test;
mod utils;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Get command line arguments
    let args: Vec<String> = env::args().collect();

    // Check if both TPS target and wallet file path are provided
    if args.len() != 3 {
        eprintln!("Usage: cargo run <tps_target> <wallet_file>");
        eprintln!("Example: cargo run tps target and wallets file name");
        std::process::exit(1);
    }

    // Get wallet file path
    let wallet_file = args[1].clone();

    // Parse TPS target
    let tps_target = match args[2].parse::<usize>() {
        Ok(num) => num,
        Err(_) => {
            eprintln!("Error: TPS target must be a positive number");
            eprintln!("Usage: cargo run <tps_target> <wallet_file>");
            eprintln!("Example: cargo run 10000 wallets.json");
            std::process::exit(1);
        }
    };

    println!("Starting concurrent TPS test");
    println!("TPS target: {}", tps_target);
    println!("Wallet file: {}", wallet_file);

    let mut test = MultiWalletTPSTest::new(tps_target, wallet_file).await?;
    test.run_tps_test().await?;
    Ok(())
}

