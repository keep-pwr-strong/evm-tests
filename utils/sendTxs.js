const { ethers } = require("ethers");

var provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const signer1 = new ethers.Wallet("0x70afd6075178fcec77dcf81799770c46c35d851fd0d7635e4265299082504275", provider);
const signer2 = new ethers.Wallet("0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6", provider);

async function main() {
	await sendTransaction()
	// await sendTransaction()
	// await sendTransaction()
}
main()

async function sendTransaction() {
	// const x = await signer1.sendTransaction({
	// 	to: "0x55D9BBeafdee6656F5E99a1e24bB6b8d4E81dB67",
	// 	value: 100000,
	// });
	// await x.wait();

    const tx = {
        to: "0x19983Fd3Db22537502830b9F9602C1aD4DBEe1d0",       // Replace with recipient address
        value: ethers.parseEther("100"), // Amount in ether
        gasLimit: 21000,                // Gas limit
        gasPrice: ethers.parseUnits("10", "gwei"), // Gas price in wei
    };
    const x = await signer2.sendTransaction(tx);
	console.log(x.hash)
}
