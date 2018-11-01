const HDWalletProvider = require("truffle-hdwallet-provider")
require("dotenv").config()

const MNEMONIC = process.env.MNEMONIC
const INFURA = process.env.INFURA

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: ""
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, `https://ropsten.infura.io/${INFURA}`)
      },
      network_id: 3,
      gas: 4000000
    }
  }
};
