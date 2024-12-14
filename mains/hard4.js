const { generateHash, getNonce, createBlock, sendTransaction } = require('../utils/index.js');
const { ethers } = require("ethers");
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

    async runTPSTest(duration = 10) {
        console.log("Starting test preparation...");
        
        // Let's test with just 10 transactions first to see if it works
        const testBatchSize = 50;
        const transactions = [];

        console.log("Preparing test transactions...");
        
        // Prepare just a few test transactions
        for (let i = 0; i < testBatchSize; i++) {
            const fromWallet = this.wallets[i];
            const toWallet = this.wallets[(i + 1) % this.wallets.length];
            
            console.log(`Preparing transaction ${i + 1}: from ${fromWallet.address} to ${toWallet.address}`);
            
            try {
                const nonce = await getNonce(fromWallet.address);
                console.log(`Got nonce for ${fromWallet.address}: ${nonce}`);
                
                const txParams = {
                    from: fromWallet.address,
                    to: toWallet.address,
                    nonce: `0x${nonce.toString(16)}`,
                    value: "0x0", // Small amount
                    newHash: generateHash(),
                    data: "0x"
                };
                
                transactions.push(txParams);
            } catch (error) {
                console.error(`Error preparing transaction ${i + 1}:`, error);
            }
        }

        console.log(`Prepared ${transactions.length} transactions. Starting to send...`);

        // Try to send transactions one by one first
        for (let tx of transactions) {
            try {
                console.log(`Sending transaction from ${tx.from}`);
                const result = await sendTransaction(tx);
                console.log("Transaction result:", result);
                
                if (result.error) {
                    console.log("Transaction failed:", result.error);
                    this.results.failed++;
                } else {
                    console.log("Transaction successful");
                    this.results.successful++;
                }
            } catch (error) {
                console.error("Error sending transaction:", error);
                this.results.failed++;
            }
        }

        try {
            console.log("Creating new block...");
            await createBlock();
            console.log("Block created successfully");
        } catch (error) {
            console.error("Error creating block:", error);
        }

        console.log("\n=== Test Results ===");
        console.log(`Successful: ${this.results.successful}`);
        console.log(`Failed: ${this.results.failed}`);
    }
}

// Test function
async function testSmallBatch() {
    console.log("Starting test with small batch...");
    const test = new MultiWalletTPSTest(50);
    await test.runTPSTest(1);
}

// Run the test
testSmallBatch().catch(console.error);