const { generateHash, getNonce, createBlock, sendTransaction } = require('../utils/index.js');
const fs = require('fs');

class MultiWalletTPSTest {
    constructor(targetTPS) {
        console.log("Initializing test...");
        this.targetTPS = targetTPS;
        this.wallets = JSON.parse(fs.readFileSync('./wallets.json', 'utf8'));
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
        const testBatchSize = 10000;
        const transactions = [];

        // Prepare transactions first
        console.log("Preparing test transactions...");
        for (let i = 0; i < testBatchSize; i++) {
            const fromWallet = this.wallets[i];
            const toWallet = this.wallets[(i + 1) % this.wallets.length];
            
            try {
                const nonce = await getNonce(fromWallet.address);
                console.log(`${i} - Got nonce for ${fromWallet.address}: ${nonce}`);
                
                const txParams = {
                    from: fromWallet.address,
                    to: toWallet.address,
                    nonce: `0x${nonce.toString(16)}`,
                    value: "0x0",
                    newHash: generateHash(),
                    data: "0x"
                };
                
                transactions.push(txParams);
            } catch (error) {
                console.error(`Error preparing transaction ${i + 1}:`, error);
            }
        }

        console.log(`Prepared ${transactions.length} transactions. Starting concurrent send...`);

        // Record start time
        this.results.startTime = Date.now();

        // Send all transactions concurrently
        try {
            const promises = transactions.map(tx => {
                return sendTransaction(tx)
                    .then(result => {
                        if (result.error) {
                            console.log(`Transaction failed from ${tx.from}:`, result.error);
                            this.results.failed++;
                            this.results.errors.push(result.error);
                        } else {
                            console.log(`Transaction successful from ${tx.from}`);
                            this.results.successful++;
                        }
                        return result;
                    })
                    .catch(error => {
                        console.error(`Transaction error from ${tx.from}:`, error);
                        this.results.failed++;
                        this.results.errors.push(error.message);
                    });
            });

            // Wait for all transactions to complete
            await Promise.all(promises);
        } catch (error) {
            console.error("Error in concurrent execution:", error);
        }

        // Record end time and calculate actual TPS
        this.results.endTime = Date.now();
        const duration = (this.results.endTime - this.results.startTime) / 1000; // Convert to seconds
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
    const test = new MultiWalletTPSTest(10000);
    await test.runTPSTest();
}

// Run the test
runConcurrentTest().catch(console.error);