const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider("http://165.227.172.177:8081");
const fromAddress = "0x19983Fd3Db22537502830b9F9602C1aD4DBEe1d0";

provider.getBlockNumber().then(console.log);
provider.getBalance(fromAddress).then(console.log);
provider.getTransactionCount(fromAddress).then(console.log);
// provider.getTransactionReceipt("0x027ca7411816644ab8fe3de620a0da86d8203ed5828b6482b9af921782e5bb61").then(console.log)

// const data1 = {
//   jsonrpc: "2.0",
//   method: "eth_getTransactionCount",
//   params: ["0x19983Fd3Db22537502830b9F9602C1aD4DBEe1d0", "latest"],
//   id: 1
// };

// fetch("http://165.227.172.177:8081", {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify(data1)
// })
// .then(res => res.json())
// .then(json => console.log("eth_getTransactionCount:", json))
// .catch(err => console.log(err));



// const data2 = {
//   jsonrpc: "2.0",
//   method: "eth_getBalance",
//   params: ["0x19983Fd3Db22537502830b9F9602C1aD4DBEe1d0", "latest"],
//   id: 1
// };

// fetch("http://165.227.172.177:8081", {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify(data2)
// })
// .then(res => res.json())
// .then(json => console.log("eth_getBalance:", json))
// .catch(err => console.log(err));