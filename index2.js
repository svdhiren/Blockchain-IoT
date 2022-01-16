require('dotenv').config(); //For accessing env variables
const Web3 = require('web3'); //For interacting with smart contract.
HDWalletProvider = require("@truffle/hdwallet-provider");

let provider = new HDWalletProvider(
    "537668a9dc2008e8053dafd3fde87f7adbefa49e7e327fe3dd0a4468961a0abe",
    'ws://localhost:7545');
const express = require('express') //For the backend server.
const Sample = require('./build/contracts/Sample.json'); //Get and instance of the contract.

const URL = 'ws://localhost:7545' //Connection to the blockchain network.
const web3 = new Web3(provider);

app = express() //Create an app using express. Used while writing the apis.
const port = process.env.PORT || 3000 //Port where the server listens for requests.
app.use(express.json()) //Parses the incoming data as json.


// const networkId = await web3.eth.net.getId();

//Provide the abi and address of the smart contract to get it's object
const sample = new web3.eth.Contract(
Sample.abi,
Sample.networks['5777'].address
);
// Now we can use this contract to call methods, send transactions, etc.

const init = async () => {
    try{
        const result = await sample.methods.without_parameters().call({from: process.env.address});
    console.log("Current stored number is: ", result);
    }
    catch{
        console.log("Transaction error 1 :(");
        // return;
    }
    // sample.methods.without_parameters().call({from: process.env.address}, function(error, result){
    //     if(error)
    //     console.log("Error: ", error);
    //     else
    //     console.log("Result: ", result);
    // })
    try{
        const tx = await sample.methods.update(5).send({from: process.env.address});
        console.log("Transaction: ", tx);
        // const gas = await tx.estimateGas({from: process.env.address});
        // const gasPrice = await web3.eth.getGasPrice();
        // const data = tx.encodeABI();
        // const nonce = await web3.eth.getTransactionCount(process.env.address);

        // const signedTx = await web3.eth.accounts.signTransaction(
        //     {
        //     to: sample.options.address, 
        //     data,
        //     gas,
        //     gasPrice,
        //     nonce,        
        //     },
        //     process.env.PRIV_KEY
        // );    
        // try{
        //     const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        //     console.log("Transaction hash: ", receipt);
        // } 
        // catch (err){
        //     console.log("Wow");
        //     throw "Transaction error 2 :(";
        // }       
    } catch (error) {
        console.log("Transaction error 3 :(");
        return;
    }
    
    

    // const eve = await sample.getPastEvents('test');
    // console.log('The events are:', eve);

    str = await sample.methods.number().call({from: process.env.address});
    console.log("Now stored number is: ", str);
}


init();

console.log("Calls with ganache checked !!");

// sample.events.test().on('data', eve => {
//     console.log("Received an event: ", eve);
// })

//This is a sample api for testing through postman/frontend.
app.get('/test', async (req, res) => {
    
    //We can write 'else' statement instead of 'return' but it's just a good practice.
  
    console.log("Request received !!");
    let ans = await sample.methods.str().call();    
    res.send({
        string: ans
    })
  })

//This starts listening for requests on the specified port.
app.listen(port, () => {
    console.log('Server is up and running on port: ', port);
})
// getAccounts();