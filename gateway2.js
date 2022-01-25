require('dotenv').config(); //For accessing env variables
const Web3 = require('web3'); //For interacting with smart contract.
const express = require('express') //For the backend server.
const Sample = require('./build/contracts/Sample.json'); //Get and instance of the contract.

// const URL1 = 'https://rinkeby.infura.io/v3/a91e7e0ca252468e986ea364558498ad' //Connection to the blockchain network.
const URL2 = 'ws://127.0.0.1:8546';
const web3 = new Web3(URL2);

app = express() //Create an app using express. Used while writing the apis.
const port = process.env.PORT || 3001 //Port where the server listens for requests.
app.use(express.json()) //Parses the incoming data as json.

//Provide the abi and address of the smart contract to get it's object
const sample = new web3.eth.Contract(
    Sample.abi,
    Sample.networks['1524'].address
    );
    // Now we can use this contract to call methods, send transactions, etc.


const init = async () => {
    
    

    //1. Assuming that admin has already registered the device.
    //2. Call "register" method to request nonce.
    //3. Hash the device public key and nonce
    //4. Send a transaction to the function "verify"

    try{
        var num = await sample.methods.without_parameters().call({from: process.env.address});
    console.log("Current stored number is: ", num);
    }
    catch{
        console.log("Transaction error 1 :(");
    }
    
    
        
    // try{
    //     const tx = sample.methods.register_gateway();
    //     const gas = await tx.estimateGas({from: process.env.address});
    //     const gasPrice = await web3.eth.getGasPrice();
    //     console.log("Gas price: ", gasPrice);
    //     const data = tx.encodeABI();
    //     const nonce = await web3.eth.getTransactionCount(process.env.address);

    //     const signedTx = await web3.eth.accounts.signTransaction(
    //         {
    //         to: sample.options.address, 
    //         data,
    //         gas,
    //         gasPrice,
    //         nonce,     
    //         chainId: networkId   
    //         },
    //         process.env.PRIV_KEY
    //     );    
    //     try{
    //         var receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    //         console.log("Transaction hash: ", receipt);
    //         var values = await sample.getPastEvents('getNonce', {fromBlock: 'latest'}); //
    //         console.log("Return values are: ", values);

    //         try{
    //             var hash = web3.utils.soliditySha3('Message signing', values[0].returnValues._nonce);
    //             var sign = web3.eth.accounts.sign(hash, process.env.PRIV_KEY);
    //             console.log("Signature : ", sign.signature);    
                
    //             // console.log("Type of hash: ", typeof(hash));
    //             // console.log("Type of sign: ", typeof(sign.signature));
    //             var auth = await sample.methods.verify(sign.signature).call({from: process.env.address});
    //             console.log("Verification status: ", auth);
    //         }
    //         catch
    //         {
    //             console.log("Authorisation failed...");
    //         }
    //     } 
    //     catch (err){
    //         console.log("Transaction error 2 :(");
    //     }       
    // } catch (error) {
    //     console.log("Transaction error 3 :(");
    // }
    
    

    // const eve = await sample.getPastEvents('test');
    // console.log('The events are:', eve);    
    str = await sample.methods.str().call();
    console.log("Now stored string is: ", str);
}


init();

console.log("Calls with geth checked !!");

sample.events.test().on('data', eve => {
    console.log("Received an event: ", eve);
})

//This is a sample api for testing through postman/frontend.
// app.get('/test', async (req, res) => {
    
//     //We can write 'else' statement instead of 'return' but it's just a good practice.
  
//     console.log("Request received !!");
//     let ans = await sample.methods.str().call();    
//     res.send({
//         string: ans
//     })
//   })

//This starts listening for requests on the specified port.
app.listen(port, () => {
    console.log('Server is up and running on port: ', port);
})
// getAccounts();