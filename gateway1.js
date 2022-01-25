require('dotenv').config(); //For accessing env variables
const Web3 = require('web3'); //For interacting with smart contract.
const express = require('express') //For the backend server.
const Sample = require('./build/contracts/Sample.json'); //Get and instance of the contract.

const URL = 'ws://127.0.0.1:8545';
const web3 = new Web3(URL);

app = express() //Create an app using express. Used while writing the apis.
const port = process.env.PORT || 3000 //Port where the server listens for requests.
app.use(express.json()) //Parses the incoming data as json.

//Provide the abi and address of the smart contract to get it's object
const sample = new web3.eth.Contract(
    Sample.abi,
    Sample.networks['1524'].address
    );
// Now we can use this contract instance to call methods, send transactions, etc.

var networkId;
web3.eth.net.getId().then((res) => {
    networkId = res;
});

/*
The below functions takes 4 parameters:
1. Name of the smart contract function to be invoked.
2. NetworkId of the private network.
3. A string describing the function
4. Array of arguments for the smart contract function.

Returns: An object with variables "tx" and "error"
One of them would be 'null' depending upon the error status. 
*/
async function create_transaction(func, str, args) {

    try{        
    const tx = func(...args);
    const gas = await tx.estimateGas({from: process.env.address});
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(process.env.address);

    const signedTx = await web3.eth.accounts.signTransaction(
        {
        to: sample.options.address, 
        data,
        gas,
        gasPrice,
        nonce,     
        chainId: networkId   
        },
        process.env.PRIV_KEY
    ); 

    return {tx: signedTx, error: null};
    }
    catch{
        return {tx: null, error: str + " transaction failed..."};
    }
    
}

/*
    Gateway registration:
    1. Gateway can register itself by executing a transaction.
    2. The smart contract stores this gateway as "registered".
    3. At the time of registration, a nonce is stored

    Gateway authentication and transaction:
    1. Everytime the gateway wants to perform a transaction, it has to request nonce.
    2. Hash it and sign it.
    3. And then perform the transaction with signature as one of it's parameter.

*/

const register = async () => {    
    
    var hash = web3.utils.soliditySha3('Register');
    var sign = web3.eth.accounts.sign(hash, process.env.PRIV_KEY);

    var res = await create_transaction(sample.methods.register_gateway, "Gateway registration", [sign.signature]);
    if(res.error)
        return "Registration unsuccessful...";
    var receipt = await web3.eth.sendSignedTransaction(res.tx.rawTransaction);
    // console.log("Transaction hash: ", receipt);    
    return "Registration successfull !!";    
}


register().then((res) => console.log(res));

sample.events.test().on('data', eve => {
    console.log("Received an event: ", eve.returnValues);
})

/******This is a sample api for testing through postman/frontend****
 * There will be similar syntax for mqtt as well
*/
app.get('/test', async (req, res) => {
    
    console.log("Request received !!");
    var str = "Yipppee";
    var old_str = await sample.methods.str().call();    
    console.log("Current stored string is: ", old_str);

    var nonce = await sample.methods.getNonce().call({from: process.env.address});
    var hash = web3.utils.soliditySha3(str, nonce);
    var sign = web3.eth.accounts.sign(hash, process.env.PRIV_KEY);
    var ans = await create_transaction(sample.methods.update_string, "String update", [str, sign.signature]);
    if(ans.error)
        return res.send({
            status: "Unsuccessful"
        })
    
    var receipt = await web3.eth.sendSignedTransaction(ans.tx.rawTransaction);

    var new_str = await sample.methods.str().call();    
    console.log("Current stored string is: ", new_str);
    return res.send({
        status: "Successfull"
    })
  })

//This starts listening for requests on the specified port.
app.listen(port, () => {
    console.log('Server is up and running on port: ', port);
})