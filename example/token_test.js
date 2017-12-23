const fs = require('fs');
const solc = require('solc');
const Web3 = require('../lib/web3');

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:1337"));

const input = fs.readFileSync('Token.sol');
const output = solc.compile(input.toString(), 1);
const contractData = output.contracts[':Token'];   
const bytecode = contractData.bytecode;   
const abi = JSON.parse(contractData.interface);
const Contract = web3.eth.contract(abi);


var validUntilBlock = 0;
const privkey = '352416e1c910e413768c51390dfd791b414212b7b4fe6b1a18f58007fa894214';
const quota = 999999;
const from = '0x0dbd369a741319fa5107733e2c9db9929093e3c7';
const to = '0x546226ed566d0abb215c9db075fc36476888b310';


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


function deployContract() {
    Contract.new({
        privkey: privkey,
        nonce: getRandomInt(),
        quota: quota,
        data: bytecode,
        validUntilBlock: validUntilBlock
    }, (err, contract) => {
        if(err) {
            console.error("--------------------------------------------------------------------------------")
            console.error(err);
            return;
            // callback fires twice, we only want the second call when the contract is deployed
        } else if(contract.address){
            myContract = contract;
            console.log('address: ' + myContract.address);

            // // get event object
            // var myEvent = myContract.Transfer();
            // // Listening event 
            // myEvent.watch(function(err, result) {
            //     if (!err) {
            //         console.log("watch event result: " + result);
            //     } else {
            //         console.log("watch event result: " + err);
            //     }
            //     myEvent.stopWatching();
            // });

            callMethodContract();
        }
    });
}


/**
 * unit testing
 */
async function callMethodContract(address) {

    const balance = myContract.getBalance.call(from);
    console.log("get balance: " + balance); 

    var result = myContract.transfer(to, '100', {
        privkey: privkey,
        nonce: getRandomInt(),
        quota: quota,
        validUntilBlock: validUntilBlock,
        from: from
    });

    console.log("transfer receipt: " + JSON.stringify(result))

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
                        const balance2 = myContract.getBalance.call(to);
                        console.log("transfer balance: " + balance2); 
                    }
                });
            }
        }
    });
}

function getRandomInt() {
    return Math.floor(Math.random() * 100).toString(); 
}
