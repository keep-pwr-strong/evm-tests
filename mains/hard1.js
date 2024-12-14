const { generateHash, getNonce, createBlock, sendTransaction } = require('../utils/index.js');
const { ethers } = require("ethers");

class EVMStressTest {
    constructor(fromAddress, toAddresses, delayBetweenBatches = 1000) {
        this.fromAddress = fromAddress;
        this.toAddresses = toAddresses;
        this.delayBetweenBatches = delayBetweenBatches;
        this.results = {
            successful: 0,
            failed: 0,
            errors: []
        };
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async sendBatchTransactions(batchSize, amount) {
        const nonce = await getNonce(this.fromAddress);
        const promises = [];

        for (let i = 0; i < batchSize; i++) {
            const toAddress = this.toAddresses[i % this.toAddresses.length];
            const txParams = {
                from: this.fromAddress,
                to: toAddress,
                nonce: `0x${(nonce + i).toString(16)}`,
                value: amount,
                newHash: generateHash(),
                data: "0x"
            };

            promises.push(sendTransaction(txParams));
        }

        try {
            const results = await Promise.all(promises);
            await createBlock();
            return results;
        } catch (error) {
            console.error("Batch failed:", error);
            throw error;
        }
    }

    async runConcurrentTest(totalTx, batchSize, amount = "0x2710") {
        console.log(`Starting concurrent test with ${totalTx} total transactions in batches of ${batchSize}`);
        const startTime = Date.now();
        const batches = Math.ceil(totalTx / batchSize);

        for (let i = 0; i < batches; i++) {
            const currentBatchSize = Math.min(batchSize, totalTx - (i * batchSize));
            try {
                console.log(`Sending batch ${i + 1}/${batches} (${currentBatchSize} transactions)`);
                const results = await this.sendBatchTransactions(currentBatchSize, amount);
                
                results.forEach(result => {
                    if (result.error) {
                        this.results.failed++;
                        this.results.errors.push(result.error);
                    } else {
                        this.results.successful++;
                    }
                });

                // Wait between batches to prevent overwhelming the node
                if (i < batches - 1) {
                    await this.sleep(this.delayBetweenBatches);
                }
            } catch (error) {
                console.error(`Batch ${i + 1} failed:`, error);
                this.results.failed += currentBatchSize;
            }
        }

        const duration = (Date.now() - startTime) / 1000;
        this.printResults(duration);
    }

    async runRapidFireTest(duration, interval = 100, amount = "0x2710") {
        console.log(`Starting rapid-fire test for ${duration}ms with ${interval}ms interval`);
        const startTime = Date.now();
        let txCount = 0;

        while (Date.now() - startTime < duration) {
            try {
                const nonce = await getNonce(this.fromAddress);
                const toAddress = this.toAddresses[txCount % this.toAddresses.length];
                
                const txParams = {
                    from: this.fromAddress,
                    to: toAddress,
                    nonce: `0x${nonce.toString(16)}`,
                    value: amount,
                    newHash: generateHash(),
                    data: "0x"
                };

                const result = await sendTransaction(txParams);
                await createBlock();
                
                if (result.error) {
                    this.results.failed++;
                    this.results.errors.push(result.error);
                } else {
                    this.results.successful++;
                }

                txCount++;
                await this.sleep(interval);
            } catch (error) {
                console.error("Transaction failed:", error);
                this.results.failed++;
            }
        }

        const durationInSeconds = duration / 1000;
        this.printResults(durationInSeconds);
    }

    printResults(duration) {
        console.log("\n=== Stress Test Results ===");
        console.log(`Duration: ${duration.toFixed(2)} seconds`);
        console.log(`Successful transactions: ${this.results.successful}`);
        console.log(`Failed transactions: ${this.results.failed}`);
        console.log(`Transactions per second: ${((this.results.successful + this.results.failed) / duration).toFixed(2)}`);
        console.log(`Success rate: ${((this.results.successful / (this.results.successful + this.results.failed)) * 100).toFixed(2)}%`);
        
        if (this.results.errors.length > 0) {
            console.log("\nError samples:");
            this.results.errors.slice(0, 5).forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
    }
}

// Example usage
async function runStressTests() {
    const fromAddress = "0x19983Fd3Db22537502830b9F9602C1aD4DBEe1d0";
    const toAddresses = [
        "0x51c984e50bc3b445904aedeafb8d4ca23b92246a",
        "0x123456789abcdef0123456789abcdef012345678", // Add more addresses as needed
    ];

    const stressTest = new EVMStressTest(fromAddress, toAddresses);

    // Run concurrent batch test
    console.log("Running concurrent batch test...");
    await stressTest.runConcurrentTest(100, 10); // 100 total transactions in batches of 10

    // Reset results for next test
    stressTest.results = { successful: 0, failed: 0, errors: [] };

    // Run rapid-fire test
    console.log("\nRunning rapid-fire test...");
    await stressTest.runRapidFireTest(60000, 100); // 1 minute test with 100ms interval
}

runStressTests();