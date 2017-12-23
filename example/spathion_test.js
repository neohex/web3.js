const fs = require('fs');
const solc = require('solc');
const Web3 = require('../lib/web3');

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:1337"));

const input = fs.readFileSync('SimpleStorage.sol');
const output = solc.compile(input.toString(), 1);
const contractData = output.contracts[':SimpleStorage'];  
const bytecode = contractData.bytecode;   
const abi = JSON.parse(contractData.interface);
const contract = web3.eth.contract(abi);

var validUntilBlock = 0;
const privkey = '352416e1c910e413768c51390dfd791b414212b7b4fe6b1a18f58007fa894214';
const quota = 999999;
const from = '0dbd369a741319fa5107733e2c9db9929093e3c7';


spathionTest();
startDeploy();

// get current block number
async function startDeploy() {
    web3.eth.getBlockNumber(function(err, res){
        if (!err) {
            validUntilBlock = res + 88;
            deployContract();
        }
    });
}

// Deploy Contract
async function deployContract() {
    contract.new({
        privkey: privkey,
        nonce: getRandomInt(),
        quota: quota,
        data: bytecode,
        validUntilBlock: validUntilBlock,
        from: from
    }, (err, contract) => {
        if(err) {
            throw new error("contract deploy error: " + err);
            return;
            // callback fires twice, we only want the second call when the contract is deployed
        } else if(contract.address){
            myContract = contract;
            console.log('address: ' + myContract.address);
            callMethodContract();
        }
    })
}


/**
 * Unit testing
 */
function callMethodContract() {
    var result =  myContract.set(5, {
        privkey: privkey,
        nonce: getRandomInt(),
        quota: quota,
        validUntilBlock: validUntilBlock,
        from: from
    });
    console.log("set method result: " + JSON.stringify(result));

    // wait for receipt
    var count = 0;
    var filter = web3.eth.filter('latest', function(err){
        if (!err) {
            count++;
            if (count > 20) {
                filter.stopWatching(function() {});
            } else {
                web3.eth.getTransactionReceipt(result.hash, function(e, receipt){
                    if(receipt) {
                        filter.stopWatching(function() {});
                        const result = myContract.get.call();
                        console.log("get method result: " + JSON.stringify(result));
                    }
                });
            }
        }
    });
}


function getRandomInt() {
    return Math.floor(Math.random() * 100).toString(); 
}


async function citaTest() {

    // * net_peerCount
    // * spathion_blockNumber
    // * spathion_sendTransaction
    // * spathion_getBlockByHash
    // * spathion_getBlockByNumber
    // * spathion_getTransaction
    // * eth_getTransactionCount
    // * eth_getCode
    // * eth_getTransactionReceipt
    // * eth_call

    console.log("--------begin test base case of spathion -------");

    //1. get spathion block height
    web3.eth.getBlockNumber(function (err, result) {
        if (err) {
            console.log("get current block height error: " + err);
        } else {
            console.log("current block height:" + result);
        }
    });


    //2. get spathion peer node count
    web3.net.getPeerCount(function (err, result) {
        if (err) {
            throw new error("get spathion peer node count error: " + err);
        } else {
            console.log("cita peer node count:" + result);
        }
    });


    //3. spathion_getBlockByHeight
    web3.eth.getBlockByNumber(0, false, function (err, result) {
        if (err) {
            throw new error("get block by height error: " + err);
        } else {
            console.log("get hash by height: " + result.hash);

            //4 spathion_getBlockByHash
            web3.eth.getBlockByHash(result.hash, function (err, result) {
                if(err) {
                    throw new error("get block by hash error: " + err);
                } else {
                    console.log("get block by hash : " + JSON.stringify(result));
                }
            });

        }
    });


    
}
