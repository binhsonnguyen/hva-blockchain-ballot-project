import React, { Component } from 'react'
import logo from './logo.svg'
import getWeb3 from './utils/getWeb3'

import Ballot from './contracts/Ballot.json'
import truffleContract from 'truffle-contract'

import './App.css'

let log = console.log

class App extends Component {

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3()

      const accounts = await web3.eth.getAccounts()

      const provider = web3.currentProvider
      provider.enable()

      const Contract = truffleContract(Ballot)
      Contract.setProvider(provider)

      const instance = await Contract.deployed()

      this.setState({web3, accounts, contract: instance}, this.runExample)
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      )
      log(error)
    }
  }

  runExample = async () => {
    const {accounts, contract} = this.state

    let proposals = Number(await contract.proposalsCount.call())
    log('proposal count', proposals)

    this.setState({proposalsCount: proposals})
  }

  render () {
    return (
      <div className='App'>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1 header">
              <img src={logo} alt="drizzle-logo"/>
              <h1>Drizzle Examples</h1>
              <p>Examples of how to get started with Drizzle in various situations.</p>

              <br/><br/>
            </div>

            <div className="pure-u-1-1">
              <h2>Active Account</h2>
              <AccountData accountIndex="0" units="ether" precision="3" />

              <br/><br/>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

export default App
