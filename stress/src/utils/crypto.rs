use ethers::utils::hex;
use rand::Rng;

pub fn generate_hash() -> String {
    let mut rng = rand::thread_rng();
    let random_bytes: Vec<u8> = (0..32).map(|_| rng.gen()).collect();
    format!("0x{}", hex::encode(random_bytes))
}