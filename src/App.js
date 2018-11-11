import React, { Component } from 'react'
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

    // this.setState({proposalsCount: proposals})
  }

  render () {
    return (
      <div className='App'>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1 header">
              <br/><br/>
              <cite>20 years from now you will be more disappointed by the things
                that you did not do than by the ones you did do, so throw off the
                bowlines, sail away from safe harbor, catch the trade winds in your
                sails. Explore, Dream, GoodDiscover.</cite>
              <blockquote>Mark Twain</blockquote>
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
  
  async updateProposals () {
    let voters = Number(await this.state.contract.votersCount.call())
    this.setState({votersCount: voters})
  }

  async updateVoters () {
    let voters = Number(await this.state.contract.votersCount.call())
    this.setState({votersCount: voters})
  }

  async start() {
    await this.state.contract.start()
  }

  async finish() {
    await this.state.contract.finish()
  }

  async nominate(proposal) {
    await this.state.contract.nominate(proposal)
  }

  async register(voter) {
    await this.state.contract.register(voter)
  }

  async vote(order) {
    await this.state.contract.vote(order)
  }

  async proposals(order) {
    await this.state.contract.proposals(order)
  }

  async proposalsCount() {
    await this.state.contract.proposalsCount()
  }

  async votedCount(proposal) {
    return Number(await this.state.contract.votedCount(proposal))
  }

  async votersCount() {
    await this.state.contract.votersCount()
  }

  async votesCount() {
    await this.state.contract.votesCount()
  }
}

export default App
