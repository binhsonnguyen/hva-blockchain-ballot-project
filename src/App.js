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

      const Contract = truffleContract(Ballot)
      Contract.setProvider(web3.currentProvider)
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
        <header className='App-header'>
          <img src={logo} className='App-logo' alt='logo'/>
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className='App-link'
            href='https://reactjs.org'
            target='_blank'
            rel='noopener noreferrer'
          >
            Learn React
          </a>
        </header>
      </div>
    )
  }
}

export default App
