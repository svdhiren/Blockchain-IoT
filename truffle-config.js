module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: 1524, // Match any network id
      from: "0xA42c43cC109D05cd5c8E81c70A2295C41fa1b459"
    }
    //,
    // rinkeby: {
    //   provider: () => provider,
    //   network_id: 4
    // }
  },
  compilers: {
    solc: {
      version: "0.8.10",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
  
}