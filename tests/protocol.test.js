const { 
    createBlock, sendTransaction, generateHash, getNonce, provider, callContract
} = require("../utils/index.js");

var contractAddress = "";

describe('ETH Transaction Tests', () => {
    // Test cases
	test('should protocol successfully send a valid transaction', async () => {
		const fromAddress = "0x19983Fd3Db22537502830b9F9602C1aD4DBEe1d0";
		const toAddress = "0x51c984e50bc3b445904aedeafb8d4ca23b92246a";

		var nonce = await getNonce(fromAddress);
		nonce = `0x${nonce.toString(16)}`;
		const newHash = generateHash();
		const amount = "0x2710";

        console.log("newHash1: ", newHash);

		const txParams = {
			from: fromAddress, to: toAddress, nonce: nonce, 
            value: amount, newHash: newHash, data: "0x"
		};

		const response = await sendTransaction(txParams);
	
		expect(response).toHaveProperty('jsonrpc', '2.0');
		expect(response).toHaveProperty('id', 1);

		expect(response).not.toHaveProperty('error');
        expect(response).toHaveProperty('result');
        expect(response.result).toBe(newHash);

		const currentBlockNumber = await provider.getBlockNumber();
		await createBlock();
		await new Promise(resolve => setTimeout(resolve, 1000));
		const blockNumber = await provider.getBlockNumber();
		expect(blockNumber).toBeGreaterThan(currentBlockNumber);

		const txReceipt = await provider.getTransactionReceipt(newHash);
		expect(txReceipt.status).toBe(1);

		const tx = await provider.getTransaction(newHash);
		expect(`0x${tx.value.toString(16)}`).toBe(amount);
		expect(`0x${tx.nonce.toString(16)}`).toBe(nonce);
		expect(tx.hash).toBe(newHash);
		expect(tx.from.toLowerCase()).toBe(fromAddress.toLowerCase());
		expect(tx.to.toLowerCase()).toBe(toAddress.toLowerCase());
	});

    test('should handle invalid address format', async () => {
		const fromAddress = "0x19983Fd3Db22537502830b9F9602C1aD4DBEe1d0";
		const toAddress = "0x51c984e50bc3b445904aedeafb8d4ca23b92246a";

		var nonce = await getNonce(fromAddress);
		nonce = `0x${nonce.toString(16)}`;
		const newHash = generateHash();
		const amount = "0x2710";

		const txParams = {
			from: 'invalid-address', to: toAddress, nonce: nonce, 
			value: amount, newHash: newHash, data: "0x"
		};

		const response = await sendTransaction(txParams);
	
		expect(response).toHaveProperty('jsonrpc', '2.0');
		expect(response).toHaveProperty('id', 1);
		expect(response).toHaveProperty('error');
		expect(response).not.toHaveProperty('result');
		expect(response.error.message).toBe(
			"invalid argument 0: json: cannot unmarshal hex string without 0x prefix into Go struct field TransactionArgs.from of type common.Address"
		);
	});

    test('should successfully send a valid transaction with a gas limit', async () => {
		const fromAddress = "0x19983Fd3Db22537502830b9F9602C1aD4DBEe1d0";
		const toAddress = "0x51c984e50bc3b445904aedeafb8d4ca23b92246a";

		var nonce = await getNonce(fromAddress);
		nonce = `0x${nonce.toString(16)}`;
		const newHash = generateHash();
		const amount = "0x2710";
		const gas = "0xb71e";

        console.log("newHash2: ", newHash);

		const txParams = {
			from: fromAddress, to: toAddress, nonce: nonce, 
			value: amount, newHash: newHash, data: "0x", gas: gas
		};

		const response = await sendTransaction(txParams);
	
		expect(response).toHaveProperty('jsonrpc', '2.0');
		expect(response).toHaveProperty('id', 1);

		expect(response).not.toHaveProperty('error');
        expect(response).toHaveProperty('result');
        expect(response.result).toBe(newHash);

		const currentBlockNumber = await provider.getBlockNumber();
		await createBlock();
		await new Promise(resolve => setTimeout(resolve, 1000));
		const blockNumber = await provider.getBlockNumber();
		expect(blockNumber).toBeGreaterThan(currentBlockNumber);

		const txReceipt = await provider.getTransactionReceipt(newHash);
		expect(txReceipt.status).toBe(1);

		const tx = await provider.getTransaction(newHash);

		expect(`0x${tx.value.toString(16)}`).toBe(amount);
		expect(`0x${tx.nonce.toString(16)}`).toBe(nonce);
		expect(`0x${tx.gasLimit.toString(16)}`).toBe(gas);
		expect(tx.hash).toBe(newHash);
		expect(tx.from.toLowerCase()).toBe(fromAddress.toLowerCase());
		expect(tx.to.toLowerCase()).toBe(toAddress.toLowerCase());
	});

    test('should successfully deploy contract', async () => {
		const fromAddress = "0x19983Fd3Db22537502830b9F9602C1aD4DBEe1d0";

		var nonce = await getNonce(fromAddress);
		nonce = `0x${nonce.toString(16)}`;
		const newHash = generateHash();

		console.log("newHash3: ", newHash);

		const txParams = {
			from: fromAddress, 
			nonce: nonce, 
            newHash: newHash, 
			data: "0x6080604052348015600e575f5ffd5b506102598061001c5f395ff3fe608060405234801561000f575f5ffd5b5060043610610034575f3560e01c806340caae06146100385780638da5cb5b14610042575b5f5ffd5b610040610060565b005b61004a61012f565b6040516100579190610192565b60405180910390f35b5f73ffffffffffffffffffffffffffffffffffffffff165f5f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16146100ee576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016100e590610205565b60405180910390fd5b335f5f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550565b5f5f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61017c82610153565b9050919050565b61018c81610172565b82525050565b5f6020820190506101a55f830184610183565b92915050565b5f82825260208201905092915050565b7f4f776e6572206164647265737320616c726561647920736574000000000000005f82015250565b5f6101ef6019836101ab565b91506101fa826101bb565b602082019050919050565b5f6020820190508181035f83015261021c816101e3565b905091905056fea2646970667358221220bef73e5302218a3386dc7487c3153383923ac88fbff768608b08afe044f48c4264736f6c634300081c0033",
		};

		const response = await sendTransaction(txParams);
	
		expect(response).toHaveProperty('jsonrpc', '2.0');
		expect(response).toHaveProperty('id', 1);

		expect(response).not.toHaveProperty('error');
        expect(response).toHaveProperty('result');
        expect(response.result).toBe(newHash);

		const currentBlockNumber = await provider.getBlockNumber();
		await createBlock();
		await new Promise(resolve => setTimeout(resolve, 1000));
		const blockNumber = await provider.getBlockNumber();
		expect(blockNumber).toBeGreaterThan(currentBlockNumber);

		const txReceipt = await provider.getTransactionReceipt(newHash);
		expect(txReceipt.status).toBe(1);
		contractAddress = txReceipt.contractAddress;

		const tx = await provider.getTransaction(newHash);

		expect(`0x${tx.nonce.toString(16)}`).toBe(nonce);
		expect(tx.hash).toBe(newHash);
		expect(tx.from.toLowerCase()).toBe(fromAddress.toLowerCase());
	});

    test('should successfully deploy contract and call function', async () => {
		const fromAddress = "0x19983Fd3Db22537502830b9F9602C1aD4DBEe1d0";

		var nonce = await getNonce(fromAddress);
		nonce = `0x${nonce.toString(16)}`;
		const newHash = generateHash();

		console.log("newHash4: ", newHash);

		const txParams = {
			from: fromAddress,
			to: contractAddress,
			nonce: nonce,
            newHash: newHash,
			data: "0x40caae06",
		};

		const response = await sendTransaction(txParams);
	
		expect(response).toHaveProperty('jsonrpc', '2.0');
		expect(response).toHaveProperty('id', 1);

		expect(response).not.toHaveProperty('error');
        expect(response).toHaveProperty('result');
        expect(response.result).toBe(newHash);

		const currentBlockNumber = await provider.getBlockNumber();
		await createBlock();
		await new Promise(resolve => setTimeout(resolve, 1000));
		const blockNumber = await provider.getBlockNumber();
		expect(blockNumber).toBeGreaterThan(currentBlockNumber);

		const txReceipt = await provider.getTransactionReceipt(newHash);
		expect(txReceipt.status).toBe(1);

		const tx = await provider.getTransaction(newHash);

		expect(`0x${tx.nonce.toString(16)}`).toBe(nonce);
		expect(tx.hash).toBe(newHash);
		expect(tx.from.toLowerCase()).toBe(fromAddress.toLowerCase());
		expect(tx.to.toLowerCase()).toBe(contractAddress.toLowerCase());

        const ethCall = await callContract({ to: contractAddress, input:"0x8da5cb5b" });
		expect(ethCall.result.toLowerCase()).toBe(
            "0x00000000000000000000000019983fd3db22537502830b9f9602c1ad4dbee1d0".toLowerCase()
        );
	});

    test('should successfully deploy contract and call revert function', async () => {
		const fromAddress = "0x55D9BBeafdee6656F5E99a1e24bB6b8d4E81dB67";

		var nonce = await getNonce(fromAddress);
		nonce = `0x${nonce.toString(16)}`;
		const newHash = generateHash();

		console.log("newHash5: ", newHash);

		const txParams = {
			from: fromAddress,
			to: contractAddress,
			nonce: nonce,
            newHash: newHash,
			data: "0x40caae06",
		};

		const response = await sendTransaction(txParams);
	
		expect(response).toHaveProperty('jsonrpc', '2.0');
		expect(response).toHaveProperty('id', 1);

		expect(response).not.toHaveProperty('error');
        expect(response).toHaveProperty('result');
        expect(response.result).toBe(newHash);

		const currentBlockNumber = await provider.getBlockNumber();
		await createBlock();
		await new Promise(resolve => setTimeout(resolve, 1000));
		const blockNumber = await provider.getBlockNumber();
		expect(blockNumber).toBeGreaterThan(currentBlockNumber);

		const txReceipt = await provider.getTransactionReceipt(newHash);
		expect(txReceipt.status).toBe(0);

		const tx = await provider.getTransaction(newHash);

		expect(`0x${tx.nonce.toString(16)}`).toBe(nonce);
		expect(tx.hash).toBe(newHash);
		expect(tx.from.toLowerCase()).toBe(fromAddress.toLowerCase());
		expect(tx.to.toLowerCase()).toBe(contractAddress.toLowerCase());

        const ethCall = await callContract({ to: contractAddress, input:"0x8da5cb5b" });
		expect(ethCall.result.toLowerCase()).toBe(
            "0x00000000000000000000000019983fd3db22537502830b9f9602c1ad4dbee1d0".toLowerCase()
        );
	});

    // test('should create a new block', async () => {
	// 	const currentBlockNumber = await provider.getBlockNumber();
	// 	await createBlock();
	// 	await new Promise(resolve => setTimeout(resolve, 2000));
	// 	const blockNumber = await provider.getBlockNumber();
	// 	expect(blockNumber).toBeGreaterThan(currentBlockNumber);
	// });
});