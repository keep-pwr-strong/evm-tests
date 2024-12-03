const { 
    createBlock, sendTransaction, generateHash, getNonce, provider, callContract
} = require("../utils.js");

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

		const txParams = {
			from: fromAddress, 
			nonce: nonce, 
            newHash: newHash, 
			data: "0x608060405234801561001057600080fd5b50610267806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806340caae061461003b5780638da5cb5b14610045575b600080fd5b610043610063565b005b61004d610134565b60405161005a9190610199565b60405180910390f35b600073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16146100f2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016100e990610211565b60405180910390fd5b336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061018382610158565b9050919050565b61019381610178565b82525050565b60006020820190506101ae600083018461018a565b92915050565b600082825260208201905092915050565b7f4f776e6572206164647265737320616c72656164792073657400000000000000600082015250565b60006101fb6019836101b4565b9150610206826101c5565b602082019050919050565b6000602082019050818103600083015261022a816101ee565b905091905056fea2646970667358221220e0c8d317df37047957e770941d17c53e5bf32da0cc320a0226b5ee7fa7a37c9d64736f6c63430008130033",
		};

		const response = await sendTransaction(txParams);
        console.log(response)
	
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

		const txParams = {
			from: fromAddress,
			to: contractAddress,
			nonce: nonce,
            newHash: newHash,
			data: "0x40caae06",
		};

		const response = await sendTransaction(txParams);
        console.log(response)
	
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

		const txParams = {
			from: fromAddress,
			to: contractAddress,
			nonce: nonce,
            newHash: newHash,
			data: "0x40caae06",
		};

		const response = await sendTransaction(txParams);
        console.log(response)
	
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