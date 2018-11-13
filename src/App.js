import React, { Component } from 'react'
import web3 from 'web3'
import getWeb3 from './utils/getWeb3'
import { Radio, RadioGroup } from 'react-radio-group'
import Ballot from './contracts/Ballot.json'
import truffleContract from 'truffle-contract'
import Finish from './utils/finishes'
import Nominate from './utils/nominate'
import Register from './utils/register'
import Start from './utils/start'
import Vote from './utils/vote'
import VotedCount from './utils/voted-count'

import './App.css'

let info = (owner, msg) => console.info(owner, msg)
let err = (owner, msg) => console.error(owner, msg)

let start = null
let finish = null
let nominate = null
let register = null
let vote = null
let votedCount = null

const Stage = {
  PREPARING: Symbol('PREPARING'),
  VOTING: Symbol('VOTING'),
  FINISHED: Symbol('FINISHED'),
  valueOf: value => {
    switch (value) {
      case 0:
        return Stage.PREPARING
      case 1:
        return Stage.VOTING
      default:
        return Stage.FINISHED
    }
  }
}

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
      start = Start(this.state.contract)
      finish = Finish(this.state.contract)
      nominate = Nominate(this.state.contract)
      register = Register(this.state.contract)
      vote = Vote(this.state.contract)
      votedCount = VotedCount(this.state.contract)

      await this.fetchProposals()
      await this.fetchVotersCount()
      await this.fetchStage()
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      )
      err('componentDidMount', error)
    }
  }
  getAccounts = async () => await this.state.web3.eth.getAccounts()
  sender = async () => (await this.getAccounts())[0]
  proposalsCount = async () => Number(await this.state.contract.proposalsCount.call({from: await this.sender()}))
  votersCount = async () => Number(await this.state.contract.votersCount.call({from: await this.sender()}))
  proposals = async (order) => await this.state.contract.proposals.call(order, {from: await this.sender()})
  votesCount = async () => await this.state.contract.votesCount.call({from: await this.sender()})
  fetchProposals = async () => {
    const count = await this.proposalsCount()
    await this.setState({PROPOSALS_COUNT: count})
    let proposals = []
    for (let i = 0; i < count; i++) {
      let hex = await this.proposals(i)
      proposals.push(web3.utils.toUtf8(hex))
    }
    this.setState({PROPOSALS: proposals})
    info('fetchProposals', await this.state.PROPOSALS_COUNT)
  }
  fetchResults = async () => {
    info('fetchResults')
  }
  fetchStage = async () => {
    let stateValue = Number(await this.state.contract.getState.call())
    this.setState({STAGE: Stage.valueOf(stateValue)})
    info('fetchStage', this.state.STAGE)
  }
  fetchVotersCount = async () => {
    const count = await this.votersCount()
    await this.setState({VOTERS_COUNT: count})
    info('fetchVotersCount', await this.state.VOTERS_COUNT)
  }
  handleNominateChanged = event => {
    this.setState({NOMINATE: event.target.value})
  }
  handleRegisterChanged = event => {
    this.setState({REGISTER: event.target.value})
  }
  handleVoteChanged = async (event) => {
    await this.setState({VOTE: event})
    info('vote changed', await this.state.VOTE)
  }
  onNominate = async () => {
    const proposal = this.state.NOMINATE
    if (window.confirm(`Xác nhận đề cử "${proposal}"?`)) {
      info('nominate', `confirmed ${proposal}`)
      await nominate(proposal).by(await this.sender())
      info('nominate', `success ${proposal}`)
      this.setState({NOMINATE: ''})
    }
  }
  onRegister = async () => {
    const voter = this.state.REGISTER
    if (window.confirm(`Xác nhận đề cử "${voter}"?`)) {
      info('nominate', `confirmed ${voter}`)
      await register(voter).by(await this.sender())
      info('nominate', `success ${voter}`)
      this.setState({REGISTER: ''})
      await this.fetchVotersCount()
    }
  }
  onStart = async () => {
    if (window.confirm(`Xác nhận bắt đầu bầu cử?`)) {
      await start().by(await this.sender())
      info('onStart', 'succeed, fetching stage')
      await this.fetchStage()
      window.alert(`Bầu cử đã bắt đầu`)
    }
  }
  onFinish = async () => {
    if (window.confirm(`Xác nhận kết thúc bầu cử?`)) {
      await finish().by(await this.sender())
      info('onFinish', 'succeed, fetching stage')
      await this.fetchStage()
      window.alert(`Bầu cử đã kết thúc`)
    }
  }
  onVote = async () => {
    const option = this.state.VOTE
    if (window.confirm(`Bạn xác nhận bầu cho "${this.state.PROPOSALS[option]}"?`)) {
      let sender = await this.sender()
      info('onVote', `confirmed vote ${option} by ${sender}`)
      await vote(this.state.VOTE).by(sender)
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      PROPOSALS_COUNT: 0,
      PROPOSALS: [],
      VOTERS_COUNT: 0,
      NOMINATE: '',
      REGISTER: '',
      VOTE: 0,
      STAGE: '',
    }
  }

  render () {
    let stageTitle, stageButton
    if (this.state.STAGE === Stage.PREPARING) {
      stageTitle = 'Đang chuẩn bị'
      stageButton = <button onClick={() => this.onStart()}>Bắt đầu</button>
    } else if (this.state.STAGE === Stage.VOTING) {
      stageTitle = 'Đang bỏ phiếu'
      stageButton = <button onClick={() => this.onFinish()}>Kết thúc</button>
    } else {
      stageTitle = 'Đã kết thúc'
    }

    return (
      <div className='App'>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1 header">
              <div id='stages' className="session">
                Trạng thái: {stageTitle} {stageButton}
                <button onClick={() => this.fetchStage()}
                        disabled={this.state.STAGE === Stage.FINISHED}>Cập nhật
                </button>
                <button onClick={() => this.fetchResults()}
                        disabled={this.state.STAGE !== Stage.FINISHED}>Hiện kết quả
                </button>
              </div>
              <div id='nominate' className="session">
                <p>Đề cử:
                  <input type="text" value={this.state.NOMINATE} onChange={this.handleNominateChanged}/>
                  <button onClick={() => this.onNominate()}>Đề cử</button>
                </p>
              </div>
              <div id='register' className="session">
                <p>Đăng ký:
                  <input type="text" value={this.state.REGISTER} onChange={this.handleRegisterChanged}/>
                  <button onClick={() => this.onRegister()}>Đăng ký</button>
                </p>
                <p>
                  Hiện có {this.state.VOTERS_COUNT} đăng ký.
                  <button onClick={() => this.fetchVotersCount()}>Cập nhật</button>
                </p>
              </div>
              <div className="session">
                <p>Hiện có {this.state.PROPOSALS_COUNT} đề cử <button onClick={() => this.fetchProposals()}>Cập
                  nhật</button></p>
                <RadioGroup name="proposals" selectedValue={this.state.VOTE} onChange={this.handleVoteChanged}>
                  {this.state.PROPOSALS.map((proposal, i) => {
                    return <label key={i}><Radio value={i}/>{proposal}<br/></label>
                  })}
                </RadioGroup>
                <button onClick={() => this.onVote()}>Bầu</button>
                <br/><br/>
              </div>
              <br/><br/>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

export default App
