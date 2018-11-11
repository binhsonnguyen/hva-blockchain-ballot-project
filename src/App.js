import React, { Component } from 'react'
import getWeb3 from './utils/getWeb3'
import { Radio, RadioGroup } from 'react-radio-group'
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
      await this.setState(state)
      info(responsible, 'app\'s state loaded with contract and accounts infomation')

      await this.fetchProposals()
      await this.fetchVotersCount()
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      )
      err('componentDidMount', error)
    }
  }
  proposalsCount = async () => Number(await this.state.contract.proposalsCount.call())
  votersCount = async () => Number(await this.state.contract.votersCount.call())
  start = async () => await this.state.contract.start()
  finish = async () => await this.state.contract.finish()
  nominate = async proposal => await this.state.contract.nominate(proposal)
  register = async voter => await this.state.contract.register(voter)
  vote = async order => await this.state.contract.vote(order)
  proposals = async (order) => await this.state.contract.proposals(order)
  votedCount = async (proposal) => Number(await this.state.contract.votedCount(proposal))
  votesCount = async () => await this.state.contract.votesCount()

  constructor (props) {
    super(props)
    this.state = {
      PROPOSALS_COUNT: 0,
      VOTERS_COUNT: 0,
      VOTE: 1
    }
  }

  async fetchProposals () {
    const count = await this.proposalsCount()
    await this.setState({PROPOSALS_COUNT: count})
    info('fetchProposals', await this.state.PROPOSALS_COUNT)
  }

  async fetchVotersCount () {
    const count = await this.votersCount()
    await this.setState({VOTERS_COUNT: count})
    info('fetchVotersCount', await this.state.VOTERS_COUNT)
  }

  async voteChanged (event) {
    await this.setState({VOTE: event})
    info('vote changed', await this.state.VOTE)
  }

  render () {
    return (
      <div className='App'>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1 header">
              <br/><br/>
              <h3>Danh sách bầu cử ( người): {this.state.PROPOSALS_COUNT}</h3>
              <RadioGroup name="proposals" selectedValue={this.state.VOTE} onChange={this.voteChanged}>
                <label><Radio value="0"/>Apple</label>
                <label><Radio value="1"/>Orange</label>
                <label><Radio value="2"/>Watermelon</label>
              </RadioGroup>
              <button onClick={() => this.fetchProposals()}>Cập nhật</button>
              <br/><br/>
              <h3>Người bỏ phiếu đã đăng ký: {this.state.VOTERS_COUNT}</h3>
              <button onClick={() => this.fetchVotersCount()}>Cập nhật</button>
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
}

export default App
