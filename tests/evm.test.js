const { ethers } = require("ethers");

var provider = new ethers.providers.JsonRpcProvider("https://rpc.doge.xyz");
const signer1 = new ethers.Wallet("0x70afd6075178fcec77dcf81799770c46c35d851fd0d7635e4265299082504275", provider);

describe('EVM Tests', () => {
    // Test cases
	test('should successfully send a valid transaction', async () => {
        const toAddress = "0x55D9BBeafdee6656F5E99a1e24bB6b8d4E81dB67";

        const tx = await signer1.sendTransaction({
            to: toAddress,
            value: 100000,
        });
        // await tx.wait();

        console.log("TX HASH:", tx.hash);

        // expect(tx.from.toLowerCase()).toBe((await signer1.getAddress()).toLowerCase());
        // expect(tx.to.toLowerCase()).toBe(toAddress.toLowerCase());
    })
});