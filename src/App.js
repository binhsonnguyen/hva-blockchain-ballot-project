import React, { Component } from 'react'
import logo from './img/banner.svg'
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

      let state = {
        web3,
        accounts,
        contract: instance
      }

      this.setState(state, this.runExample)
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      )
      log(error)
    }
  }

  runExample = async () => {
    const {accounts, contract} = this.state

    this.updateProposals()

    let voters = Number(await contract.votersCount.call())

    // this.setState({proposalsCount: proposals})
  }

  render () {
    return (
      <div className='App'>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1 header">
              <img src={logo} alt="drizzle-logo"/>
              <br/><br/>
              <h3>Danh sách bầu cử ( người):</h3>
              // TODO: radio list + Button Vote
              <button onClick={() => this.updateProposals()}>Cập nhật</button>
              <br/><br/>
              <h3>Người bỏ phiếu đã đăng ký: </h3>
              <button onClick={() => this.updateVoters()}>Cập nhật</button>
              <br/><br/>
            </div>

            <div className="pure-u-1-1">
              <h2>Active Account</h2>

              <br/><br/>
            </div>
          </div>
        </main>
      </div>
    )
  }

  updateProposals () {
    log("hello")
  }

  updateVoters () {
    log("hello")
  }
}

export default App
