require('dotenv').config();
const Web3 = require('web3');
const express = require('express')
const Sample = require('./build/contracts/Sample.json');

const URL = 'ws://localhost:7545'
const address = '0x76b3E909B2bCd1841045283a0192dae8607e94AE'
const web3 = new Web3(URL);

app = express()
const port = process.env.PORT || 3000
app.use(express.json())


// Below function is just for testing the connection with ganache.
// const getAccounts = async () => {
//     const accounts = await web3.eth.getAccounts();
//     console.log(accounts);
// }
// const networkId = await web3.eth.net.getId();
const sample = new web3.eth.Contract(
Sample.abi,
Sample.networks['5777'].address
);

const init = async () => {
    // Now we can use this contract to call methods, send transactions, etc.
    var str = await sample.methods.str().call();
    console.log("Current stored string is: ", str);
    try{
        const tx = sample.methods.update_string('yayy');
        const gas = await tx.estimateGas({from: address});
        const gasPrice = await web3.eth.getGasPrice();
        const data = tx.encodeABI();
        const nonce = await web3.eth.getTransactionCount(address);

        const signedTx = await web3.eth.accounts.signTransaction(
            {
            to: sample.options.address, 
            data,
            gas,
            gasPrice,
            nonce,        
            },
            process.env.PRIV_KEY
        );    
        try{
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            console.log("Transaction hash: ", receipt.transactionHash);
        } 
        catch (err){
            console.log("Wow");
            throw "Transaction error 1 :(";
        }       
    } catch (error) {
        console.log("Transaction error 2 :(");
        return;
    }
    
    

    // const eve = await sample.getPastEvents('test');
    // console.log('The events are:', eve);

    str = await sample.methods.str().call();
    console.log("Now stored string is: ", str);
}


init();

console.log("Calls with ganache checked !!");

// sample.events.test().on('data', eve => {
//     console.log("Received an event: ", eve);
// })

app.get('/test', async (req, res) => {
    
    //We can write 'else' statement instead of 'return' but it's just a good practice.
  
    console.log("Request received !!");
    let ans = await sample.methods.str().call();    
    res.send({
        string: ans
    })
  })

app.listen(port, () => {
    console.log('Server is up and running...')
})
// getAccounts();