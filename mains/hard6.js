const { generateHash, getNonce, createBlock, sendTransaction } = require('../utils/index.js');
const fs = require('fs');

const tps = process.argv[2];
const filePath = `./${process.argv[3]}.json`;

class MultiWalletTPSTest {
    constructor(targetTPS) {
        console.log("Initializing test...");
        this.targetTPS = targetTPS;
        this.wallets = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`Loaded ${this.wallets.length} wallets`);
        this.results = {
            successful: 0,
            failed: 0,
            errors: [],
            startTime: null,
            endTime: null,
            actualTPS: 0
        };
    }

    async runTPSTest() {
        console.log("Starting test preparation...");
        const batchSize = 2000;
        const totalTransactions = tps;
        
        console.log("Fetching nonces for all wallets...");
        const nonces = await Promise.all(this.wallets.map(wallet => getNonce(wallet.address)));

        console.log("Starting transaction sending...");
        this.results.startTime = Date.now();

        // Prepare and send transactions in parallel batches
        for (let i = 0; i < totalTransactions; i += batchSize) {
            const batchPromises = [];

            for (let j = 0; j < batchSize; j++) {
                if (i + j >= totalTransactions) break;
                
                const fromWallet = this.wallets[(i + j) % this.wallets.length];
                const toWallet = this.wallets[(i + j + 1) % this.wallets.length];
                const nonce = nonces[(i + j) % this.wallets.length]++;

                const txParams = {
                    from: fromWallet.address,
                    to: toWallet.address,
                    nonce: `0x${nonce.toString(16)}`,
                    value: "0x0",
                    newHash: generateHash(),
                    data: "0x"
                };

                batchPromises.push(
                    sendTransaction(txParams)
                        .then(result => {
                            if (result.error) {
                                this.results.failed++;
                                this.results.errors.push(result.error);
                            } else {
                                this.results.successful++;
                            }
                        })
                        .catch(error => {
                            this.results.failed++;
                            this.results.errors.push(error.message);
                        })
                );
            }

            await Promise.all(batchPromises);
            console.log(`Batch ${(i / batchSize) + 1} completed`);
        }

        this.results.endTime = Date.now();
        const duration = (this.results.endTime - this.results.startTime) / 1000;
        this.results.actualTPS = this.results.successful / duration;

        try {
            console.log("Creating new block...");
            await createBlock();
            console.log("Block created successfully");
        } catch (error) {
            console.error("Error creating block:", error);
        }

        console.log("\n=== Test Results ===");
        console.log(`Duration: ${duration.toFixed(2)} seconds`);
        console.log(`Successful: ${this.results.successful}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Actual TPS: ${this.results.actualTPS.toFixed(2)}`);

        if (this.results.errors.length > 0) {
            console.log("\nErrors encountered:");
            this.results.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
    }
}

// Test function
async function runConcurrentTest() {
    console.log("Starting concurrent TPS test...");
    const test = new MultiWalletTPSTest(tps);
    await test.runTPSTest();
}

// Run the test
runConcurrentTest().catch(console.error);
