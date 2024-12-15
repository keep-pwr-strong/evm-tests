const { generateHash, getNonce, createBlock, sendTransaction } = require('../utils/index.js');
const { ethers } = require("ethers");

class HighTPSTest {
    constructor(fromAddress, toAddresses) {
        this.fromAddress = fromAddress;
        this.toAddresses = toAddresses;
        this.results = {
            successful: 0,
            failed: 0,
            errors: [],
            startTime: null,
            endTime: null
        };
    }

    async sendParallelBatch(startNonce, batchSize, amount = "0x0") {
        const promises = [];
        
        for (let i = 0; i < batchSize; i++) {
            const toAddress = this.toAddresses[i % this.toAddresses.length];
            const txParams = {
                from: this.fromAddress,
                to: toAddress,
                nonce: `0x${(startNonce + i).toString(16)}`,
                value: amount,
                newHash: generateHash(),
                data: "0x"
            };
            
            promises.push(sendTransaction(txParams));
        }

        return Promise.all(promises);
    }

    async run1000TPS(durationSeconds = 10) {
        console.log(`Attempting 1000 TPS test for ${durationSeconds} seconds...`);
        
        // Calculate total transactions needed
        const totalTransactions = durationSeconds * 2000;
        const batchSize = 400; // Send 100 transactions per batch
        const batches = Math.ceil(totalTransactions / batchSize);
        const batchInterval = 100; // Time in ms between batches
        
        // Get initial nonce
        const initialNonce = await getNonce(this.fromAddress);
        
        this.results.startTime = Date.now();
        let currentNonce = initialNonce;
        
        try {
            for (let i = 0; i < batches; i++) {
                const currentBatchSize = Math.min(batchSize, totalTransactions - (i * batchSize));
                
                // Send batch of transactions
                console.log(`Sending batch ${i + 1}/${batches} (${currentBatchSize} transactions)`);
                const batchPromise = this.sendParallelBatch(currentNonce, currentBatchSize);
                
                // Create new block immediately after sending transactions
                const blockPromise = await createBlock();
                
                // Wait for both transactions and block creation
                const [txResults] = await Promise.all([batchPromise, blockPromise]);
                
                // Update statistics
                txResults.forEach(result => {
                    if (result.error) {
                        this.results.failed++;
                        this.results.errors.push(result.error);
                    } else {
                        this.results.successful++;
                    }
                });
                
                currentNonce += currentBatchSize;
                
                // Small delay between batches to prevent overwhelming the node
                if (i < batches - 1) {
                    await new Promise(resolve => setTimeout(resolve, batchInterval));
                }
            }
        } catch (error) {
            console.error("Test failed:", error);
        }
        
        await createBlock();
        this.results.endTime = Date.now();
        this.printResults();
    }

    printResults() {
        const duration = (this.results.endTime - this.results.startTime) / 1000;
        const totalTx = this.results.successful + this.results.failed;
        const tps = totalTx / duration;
        
        console.log("\n=== High TPS Test Results ===");
        console.log(`Duration: ${duration.toFixed(2)} seconds`);
        console.log(`Total Transactions: ${totalTx}`);
        console.log(`Successful: ${this.results.successful}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Actual TPS: ${tps.toFixed(2)}`);
        console.log(`Success Rate: ${((this.results.successful / totalTx) * 100).toFixed(2)}%`);
        
        if (this.results.errors.length > 0) {
            console.log("\nSample Errors:");
            this.results.errors.slice(0, 5).forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
    }
}

// Example usage
async function runHighTPSTest() {
    const fromAddress = "0x19983Fd3Db22537502830b9F9602C1aD4DBEe1d0";
    // Using multiple addresses to distribute the load
    const toAddresses = [
        "0x51c984e50bc3b445904aedeafb8d4ca23b92246a",
        "0x123456789abcdef0123456789abcdef012345678",
        "0x987654321abcdef0123456789abcdef012345678",
        "0xabcdef0123456789abcdef0123456789abcdef01",
        "0xfedcba9876543210fedcba9876543210fedcba98"
    ];

    const tpsTest = new HighTPSTest(fromAddress, toAddresses);
    
    // Run for 10 seconds trying to achieve 1000 TPS
    await tpsTest.run1000TPS(10);
}

runHighTPSTest();