const path = require('path');
const nearAPI = require('near-api-js');

const homedir = path.dirname(__dirname) ;//require("os").homedir();
const CREDENTIALS_DIR = ".near-credentials";
const credentialsPath = path.join(homedir, CREDENTIALS_DIR);

const keyStore = new nearAPI.keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

// configuration for connecting to testnet
const config = {
    networkId: "testnet",
    keyStore: keyStore, // optional if not signing transactions
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
};

module.exports = {
    init : async () => {
        const near = await nearAPI.connect(config);
    
        // load account
        const account = await near.account("ntc.testnet");
    
        // load contract
        let contract = new nearAPI.Contract(
            account, // the account object that is connecting
            process.env.CONTRACT_NAME, // contract name
            {
                // name of contract you're connecting to
                viewMethods: ["getGreeting", "getVoteInfo"], // view methods do not change state but usually return a value
                changeMethods: ["setGreeting", "createVote", "registerVote","unregisterVote","voteFor","getUserData"], // change methods modify state
                sender: account, // account object to initialize and sign transactions.
            }
        );

        //console.log(await contract.setGreeting({ message : "HEllo world"}));
        //console.log(await contract.getGreeting({ accountId : "ntc.testnet" }));

        return contract;
    }
}

