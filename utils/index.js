const axios = require("axios");
const { ethers } = require("ethers");
require('dotenv').config();

const client = axios.create({
    baseURL: process.env.RPC_API,
    headers: {
        'Content-Type': 'application/json'
    }
});

const provider = new ethers.JsonRpcProvider(process.env.RPC_API);

async function sendTransaction(params) {
    const request = {
            jsonrpc: '2.0',
            method: 'eth_sendTx',
            params: [params],
            id: 1
    };

    try {
        const response = await client.post('', request);
        return response.data;
    } catch (error) {
        if (error.response) {
            return error.response.data;
        }
        throw error;
    }
}

async function callContract(params) {
    const request = {
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [params],
            id: 1
    };

    try {
        const response = await client.post('', request);
        return response.data;
    } catch (error) {
        if (error.response) {
            return error.response.data;
        }
        throw error;
    }
}

async function createBlock() {
    const timestamp = new Date().getTime();

    const request = {
        jsonrpc: '2.0',
        method: 'miner_createBlock',
        params: [parseInt(timestamp.toString().slice(0, 10), 10)],
        id: 1
    };

    try {
        const response = await client.post('', request);
        return response.data;
    } catch (error) {
        if (error.response) {
            return error.response.data;
        }
        throw error;
    }
}

async function getNonce(fromAddress) {
    const nonce = await provider.getTransactionCount(fromAddress);
    return nonce;
}

function generateHash() {
    const randomBytes = ethers.randomBytes(32);
    const hash = ethers.hexlify(randomBytes);
    return hash;
}

module.exports = { generateHash, getNonce, createBlock, sendTransaction, provider, callContract }