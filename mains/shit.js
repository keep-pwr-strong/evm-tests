const fs = require('fs');
const { generateHash, getNonce, createBlock, sendTransaction } = require('../utils/index.js');
const { ethers } = require("ethers");

class WalletFunder {
    constructor(fromAddress, batchSize = 50) {
        this.fromAddress = fromAddress;
        this.batchSize = batchSize;
        this.results = {
            successful: 0,
            failed: 0,
            errors: []
        };
    }

    async fundWallets(amount = "0x0") { // 0 ETH in hex
        try {
            // Read wallets from JSON file
            const wallets = JSON.parse(fs.readFileSync('./wallets.json', 'utf8'));
            console.log(`Found ${wallets.length} wallets to fund`);

            let currentNonce = await getNonce(this.fromAddress);
            const batches = Math.ceil(wallets.length / this.batchSize);

            for (let i = 0; i < batches; i++) {
                const start = i * this.batchSize;
                const end = Math.min(start + this.batchSize, wallets.length);
                const currentBatch = wallets.slice(start, end);

                console.log(`\nProcessing batch ${i + 1}/${batches} (${start + 1}-${end})`);
                
                const batchPromises = currentBatch.map((wallet, index) => {
                    const txParams = {
                        from: this.fromAddress,
                        to: wallet.address,
                        nonce: `0x${(currentNonce + index).toString(16)}`,
                        value: amount,
                        newHash: generateHash(),
                        data: "0x"
                    };

                    return sendTransaction(txParams);
                });

                try {
                    const results = await Promise.all(batchPromises);
                    await createBlock();

                    results.forEach((result, index) => {
                        if (result.error) {
                            this.results.failed++;
                            this.results.errors.push({
                                address: currentBatch[index].address,
                                error: result.error
                            });
                            console.log(`❌ Failed to fund ${currentBatch[index].address}`);
                        } else {
                            this.results.successful++;
                            console.log(`✅ Successfully funded ${currentBatch[index].address}`);
                        }
                    });

                    currentNonce += currentBatch.length;
                    
                    // Small delay between batches
                    if (i < batches - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } catch (error) {
                    console.error(`Batch ${i + 1} failed:`, error);
                    this.results.failed += currentBatch.length;
                }
            }

            this.printResults();
            return this.results;

        } catch (error) {
            console.error("Failed to read wallets or process funding:", error);
            throw error;
        }
    }

    printResults() {
        console.log("\n=== Funding Results ===");
        console.log(`Total wallets processed: ${this.results.successful + this.results.failed}`);
        console.log(`Successfully funded: ${this.results.successful}`);
        console.log(`Failed to fund: ${this.results.failed}`);
        
        if (this.results.errors.length > 0) {
            console.log("\nFailed Transactions (first 5):");
            this.results.errors.slice(0, 5).forEach(({address, error}, index) => {
                console.log(`${index + 1}. Address: ${address}\n   Error: ${error}`);
            });
        }
    }

    // Save results to a file
    saveResults(filename = 'funding-results.json') {
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(`\nResults saved to ${filename}`);
    }
}

// Example usage
async function fundAllWallets() {
    const fromAddress = "0x55D9BBeafdee6656F5E99a1e24bB6b8d4E81dB67";
    const funder = new WalletFunder(fromAddress, 500); // Process 50 wallets per batch
    
    // Fund each wallet with 1 ETH (can be modified by passing different amount)
    await funder.fundWallets();
    
    // Save results to file
    funder.saveResults();
}

fundAllWallets();