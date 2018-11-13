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

class Proposal {
  constructor () {
    this.name = ''
    this.vote = 0
  }

  withName (name) {
    this.name = name
    return this
  }

  withVote (vote) {
    this.vote = vote
    return this
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

      await this.fetchAll()
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
  votesCount = async () => Number(await this.state.contract.votesCount.call({from: await this.sender()}))
  proposals = async (order) => await this.state.contract.proposals.call(order, {from: await this.sender()})
  fetchAll = async () => {
    await this.fetchProposals()
    await this.fetchResults()
    await this.fetchStage()
    await this.fetchVotersCount()
    await this.fetchVotesCount()
  }
  fetchProposals = async () => {
    const count = await this.proposalsCount()
    let proposals = []
    for (let i = 0; i < count; i++) {
      let hex = await this.proposals(i)
      let name = web3.utils.toUtf8(hex)
      proposals.push(new Proposal().withName(name))
    }
    this.setState({PROPOSALS: proposals})
    info('fetchProposals', await this.state.PROPOSALS.length)
  }
  fetchResults = async () => {
    if (this.state.STAGE !== Stage.FINISHED) {
      info('fetchResults', 'REJECTED')
      return
    }
    info('fetchResults')
    let proposals =
      this.setState(
        {
          PROPOSALS: await Promise.all(
            this.state.PROPOSALS
              .map(async proposal => {
                  let hex = web3.utils.fromUtf8(proposal.name)
                  let vote = Number(await votedCount().of(hex))
                  return proposal.withVote(vote)
                }
              )
          )
        })
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
  fetchVotesCount = async () => {
    const count = await this.votesCount()
    await this.setState({VOTES_COUNT: count})
    info('fetchVotesCount', this.state.VOTES_COUNT)
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
      await this.fetchProposals()
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
    if (window.confirm(`Bạn xác nhận bầu cho "${this.state.PROPOSALS[option].name}"?`)) {
      let sender = await this.sender()
      info('onVote', `confirmed vote ${option} by ${sender}`)
      await vote(this.state.VOTE).by(sender)
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      PROPOSALS: [],
      VOTERS_COUNT: 0,
      VOTES_COUNT: 0,
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
              </div>
              <div id='stats' className="session">
                <p>Đề cử: <u>{this.state.PROPOSALS.length}</u> đối tượng.
                  <button onClick={() => this.fetchProposals()}>Cập nhật</button>
                </p>
                <p>
                  Đăng ký bỏ phiếu: <u>{this.state.VOTERS_COUNT}</u> đối tượng.
                  <button onClick={() => this.fetchVotersCount()}>Cập nhật</button>
                </p>
                <p>
                  Có <u>{this.state.VOTES_COUNT}</u> đối tượng đã bỏ phiếu.
                  <button onClick={() => this.fetchVotesCount()}>Cập nhật</button>
                </p>
                <p>
                  <button onClick={() => this.fetchAll()}>Cập nhật tất cả</button>
                </p>
              </div>
              <div id='nominate' className="session">
                <p>Đề cử:
                  <input type="text"
                         value={this.state.NOMINATE}
                         onChange={this.handleNominateChanged}
                         disabled={this.state.STAGE !== Stage.PREPARING}/>
                  <button onClick={() => this.onNominate()}
                          disabled={this.state.STAGE !== Stage.PREPARING}>Đề cử
                  </button>
                </p>
              </div>
              <div id='register' className="session">
                <p>Đăng ký:
                  <input type="text"
                         value={this.state.REGISTER}
                         onChange={this.handleRegisterChanged}
                         disabled={this.state.STAGE !== Stage.PREPARING}/>
                  <button onClick={() => this.onRegister()}
                          disabled={this.state.STAGE !== Stage.PREPARING}>Đăng ký
                  </button>
                </p>
              </div>
              <div className="session">
                <RadioGroup name="proposals"
                            selectedValue={this.state.VOTE}
                            onChange={this.handleVoteChanged}>
                  {this.state.PROPOSALS.map((proposal, i) => {
                    return (
                      <label key={i}>
                        <Radio value={i}
                               disabled={this.state.STAGE !== Stage.VOTING}/>{proposal.name}
                        <br/>
                      </label>
                    )
                  })}
                </RadioGroup>
                <button onClick={() => this.onVote()}
                        disabled={this.state.STAGE !== Stage.VOTING}>Bầu
                </button>
                <button onClick={() => this.fetchResults()}
                        disabled={this.state.STAGE !== Stage.FINISHED}>Hiện kết quả
                </button>
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
