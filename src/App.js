import React, { Component } from 'react'
import getWeb3 from './utils/getWeb3'

import Ballot from './contracts/Ballot.json'
import truffleContract from 'truffle-contract'

import './App.css'

let info = (owner, msg) => console.info(owner, msg)
let err = (owner, msg) => console.error(owner, msg)

class App extends Component {

  componentDidMount = async () => {
    try {
      const responsible = 'componentDidMount'
      info(responsible, 'ready to load')

      const web3 = await getWeb3()
      info(responsible, 'web3 loaded')

      const accounts = await web3.eth.getAccounts()
      info(responsible, 'accounts loaded')

      const provider = web3.currentProvider
      await provider.enable()
      info(responsible, 'web3 enabled')

      const Contract = truffleContract(Ballot)
      Contract.setProvider(provider)

      const instance = await Contract.deployed()
      info(responsible, 'contract positioned')

      let state = {
        web3,
        accounts,
        contract: instance
      }
      this.setState(state)
      info(responsible, 'app\'s state loaded with contract and accounts infomation')
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      )
      err('componentDidMount', error)
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      proposalsCount: 0,
      votersCount: 0
    }
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
              <h3>Danh sách bầu cử ( người): {this.state.votersCount}</h3>
              // TODO: radio list + Button Vote
              <button onClick={() => this.updateProposals()}>Cập nhật</button>
              <br/><br/>
              <h3>Người bỏ phiếu đã đăng ký: {this.state.proposalsCount}</h3>
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

  async start () {
    await this.state.contract.start()
  }

  async finish () {
    await this.state.contract.finish()
  }

  async nominate (proposal) {
    await this.state.contract.nominate(proposal)
  }

  async register (voter) {
    await this.state.contract.register(voter)
  }

  async vote (order) {
    await this.state.contract.vote(order)
  }

  async proposals (order) {
    await this.state.contract.proposals(order)
  }

  async proposalsCount () {
    await this.state.contract.proposalsCount()
  }

  async votedCount (proposal) {
    return Number(await this.state.contract.votedCount(proposal))
  }

  async votersCount () {
    await this.state.contract.votersCount()
  }

  async votesCount () {
    await this.state.contract.votesCount()
  }
}

export default App
