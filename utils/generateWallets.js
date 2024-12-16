const fs = require('fs');
const { Wallet } = require('ethers');

const NUM_WALLETS = 20000;
const OUTPUT_FILE = 'wallet.json';

function generateWallets(num) {
  const wallets = [];

  for (let i = 0; i < num; i++) {
    const wallet = Wallet.createRandom();
    wallets.push({
      privateKey: wallet.privateKey,
      address: wallet.address,
    });
    console.log(`${i} - ${wallet.address}`);
  }

  return wallets;
}

(async () => {
  const wallets = generateWallets(NUM_WALLETS);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(wallets, null, 2));
  console.log(`${NUM_WALLETS} wallets have been generated and saved to ${OUTPUT_FILE}`);
})();
