const Ballot = artifacts.require('./Ballot.sol')

const Nominate = require('../libs/nominate.js')
const Register = require('../libs/register.js')
const Start = require('../libs/start.js')
const Finish = require('../libs/finishes.js')
const VotedCount = require('../libs/voted-count.js')
const Vote = require('../libs/vote.js')
const attempt = require('./libs/attempt.js')

const log = console.log

const A_PROPOSAL = 'WINNER' // 0x57494e4e4552
const ANOTHER_PROPOSAL = 'LOOSER' // 0x4c4f4f534552
const WINNER = 0 // 0x4c4f4f534552
const LOOSER = 1 // 0x4c4f4f534552
const StateValues = {
  PREPARING: 0,
  VOTING: 1,
  FINISHED: 2,
}

contract('ballot, given when preparing, it...', accounts => {
  const CHAIR = accounts[0]
  const A_VOTER = accounts[1]
  const AN_OTHER_VOTER = accounts[2]

  let contract = null
  let nominate = null
  let register = null
  let start = null
  let vote = null
  let finishes = null

  beforeEach(async () => {
    contract = await Ballot.new()
    nominate = Nominate(contract)
    register = Register(contract)
    start = Start(contract)
    vote = Vote(contract)
    finishes = Finish(contract)
  })

  it('...should let people know current state', async () => {
    let state = Number(await contract.getState.call())
    assert.strictEqual(state, StateValues.PREPARING)
  })

  it('...should reject others registering', async () => {
    await attempt(async () => {
      await register(A_VOTER).by(AN_OTHER_VOTER)
    }).should.be.rejected()
  })

  it('...should let chairman add proposals', async () => {
    await attempt(async () => {
      await nominate(A_PROPOSAL).by(CHAIR)
    }).should.be.succeed()
  })

  it('...should let people get proposals count', async () => {
    await nominate(A_PROPOSAL).by(CHAIR)
    await nominate(ANOTHER_PROPOSAL).by(CHAIR)
    let expected = 2
    let actual = Number(await contract.proposalsCount.call())
    assert.strictEqual(actual, expected)
  })

  it('...should let people get proposals name', async () => {
    await nominate(A_PROPOSAL).by(CHAIR)
    let expected = web3.fromUtf8(A_PROPOSAL)
    let result = await contract.proposals.call(0)
    assert.ok(result.startsWith(expected))

    await nominate(ANOTHER_PROPOSAL).by(CHAIR)
    let anOtherExpected = web3.fromUtf8(ANOTHER_PROPOSAL)
    let anOtherResult = await contract.proposals.call(1)
    assert.ok(anOtherResult.startsWith(anOtherExpected))
  })

  it('...should let chairman register voters', async () => {
    await attempt(async () => {
      await register(A_VOTER).by(CHAIR)
      await register(AN_OTHER_VOTER).by(CHAIR)
    }).should.be.succeed()
  })

  it('...should let chairman register his self', async () => {
    await attempt(async () => {
      await register(CHAIR).by(CHAIR)
    }).should.be.succeed()
  })

  it('...should reject someone else register a voter', async () => {
    await attempt(async () => {
      await register(A_VOTER).by(AN_OTHER_VOTER)
    }).should.be.rejected()
  })

  it('...should reject chairman register a voter twice', async () => {
    await attempt(async () => {
      await register(A_VOTER).by(CHAIR)
      await register(A_VOTER).by(CHAIR)
    }).should.be.rejected()
  })

  it('...should reject registered voter do vote too soon', async () => {
    await attempt(async () => {
      await nominate(A_PROPOSAL).by(CHAIR)
      await register(A_VOTER).by(CHAIR)
      await vote(WINNER).by(A_VOTER)
    }).should.be.rejected()
  })

  it('...should let chairman start ballot pharse', async () => {
    await attempt(async () => {
      await nominate(A_PROPOSAL).by(CHAIR)
      await nominate(ANOTHER_PROPOSAL).by(CHAIR)
      await start().by(CHAIR)
    }).should.be.succeed()
  })

  it('...should reject chairman start ballot pharse if at least two proposal nominated', async () => {
    await attempt(async () => {
      await nominate(A_PROPOSAL).by(CHAIR)
      await start().by(CHAIR)
    }).should.be.rejected()
  })

  it('...should reject others start ballot', async () => {
    await attempt(async () => {
      await nominate(A_PROPOSAL).by(CHAIR)
      await nominate(AN_OTHER_VOTER).by(CHAIR)
      await start().by(A_VOTER)
    }).should.be.rejected()
  })

  it('...should reject chairman finishes ballot', async () => {
    await attempt(async () => {
      await finishes().by(CHAIR)
    }).should.be.rejected()
  })
})

contract('ballot, given when started, it...', accounts => {
  const CHAIR = accounts[0]
  const A_VOTER = accounts[1]
  const AN_OTHER_VOTER = accounts[2]
  const NOT_REGISTERED = accounts[3]

  let contract = null
  let nominate = null
  let register = null
  let start = null
  let finishes = null
  let vote = null

  beforeEach(async () => {
    contract = await Ballot.new()
    nominate = Nominate(contract)
    register = Register(contract)
    start = Start(contract)
    finishes = Finish(contract)
    vote = Vote(contract)
    await nominate(A_PROPOSAL).by(CHAIR)
    await nominate(ANOTHER_PROPOSAL).by(CHAIR)
    await register(CHAIR).by(CHAIR)
    await register(A_VOTER).by(CHAIR)
    await register(AN_OTHER_VOTER).by(CHAIR)
    await start().by(CHAIR)
  })

  it('...should let people know current state', async () => {
    let state = Number(await contract.getState.call())
    assert.strictEqual(state, StateValues.VOTING)
  })

  it('...should reject chairman do register', async () => {
    await attempt(async () => {
      await register(A_VOTER).by(CHAIR)
    }).should.be.rejected()
  })

  it('...should let registered voter do vote', async () => {
    await attempt(async () => {
      await vote(WINNER).by(A_VOTER)
    }).should.be.succeed()
  })

  it('...should reject not registered voter do vote', async () => {
    await attempt(async () => {
      await vote(WINNER).by(NOT_REGISTERED)
    }).should.be.rejected()
  })

  it('...should reject registered voter do vote twice', async () => {
    await attempt(async () => {
      await vote(WINNER).by(A_VOTER)
      await vote(LOOSER).by(A_VOTER)
    }).should.be.rejected()
  })

  it('...should let chairman could do vote, too', async () => {
    await attempt(async () => {
      await vote(WINNER).by(CHAIR)
    }).should.be.succeed()
  })

  it('...should let chairman finishes ballot', async () => {
    await attempt(async () => {
      await vote(WINNER).by(A_VOTER)
      await vote(LOOSER).by(AN_OTHER_VOTER)
      await finishes().by(CHAIR)
    }).should.be.succeed()
  })

  it('...should reject voter finishes ballot', async () => {
    await attempt(async () => {
      await vote(WINNER).by(A_VOTER)
      await vote(LOOSER).by(AN_OTHER_VOTER)
      await finishes().by(A_VOTER)
    }).should.be.rejected()
  })

  it('...only let chairman finishes ballot when at least a half of voter has been voted', async () => {
    await attempt(async () => {
      await vote(WINNER).by(A_VOTER)
      await finishes().by(CHAIR)
    }).should.be.rejected()
  })
})


contract('ballot, given when finished, it...', accounts => {
  const CHAIR = accounts[0]
  const A_VOTER = accounts[1]
  const AN_OTHER_VOTER = accounts[2]
  const NOT_REGISTERED = accounts[3]

  let contract = null
  let nominate = null
  let register = null
  let start = null
  let finishes = null
  let votedCount = null
  let vote = null

  beforeEach(async () => {
    contract = await Ballot.new()
    nominate = Nominate(contract)
    register = Register(contract)
    start = Start(contract)
    finishes = Finish(contract)
    votedCount = VotedCount(contract)
    vote = Vote(contract)
    await nominate(A_PROPOSAL).by(CHAIR)
    await nominate(ANOTHER_PROPOSAL).by(CHAIR)
    await register(CHAIR).by(CHAIR)
    await register(A_VOTER).by(CHAIR)
    await register(AN_OTHER_VOTER).by(CHAIR)
    await start().by(CHAIR)
  })

  it('...should let chairman finishes ballot', async () => {
    await attempt(async () => {
      await vote(WINNER).by(A_VOTER)
      await vote(WINNER).by(AN_OTHER_VOTER)
      await finishes().by(CHAIR)
    }).should.be.succeed()
  })

  it('...should let people know current state', async () => {
    await vote(WINNER).by(A_VOTER)
    await vote(WINNER).by(AN_OTHER_VOTER)
    await finishes().by(CHAIR)
    let state = Number(await contract.getState.call())
    assert.strictEqual(state, StateValues.FINISHED)
  })

  it('...should let people get voted count of a specified proposal', async () => {
    await vote(WINNER).by(A_VOTER)
    await vote(WINNER).by(AN_OTHER_VOTER)
    await finishes().by(CHAIR)
    let voted = Number(await votedCount().of(A_PROPOSAL))
    assert.strictEqual(voted, 2)
  })

  it('...only counts votes after finished', async () => {
    await attempt(async () => {
      await vote(WINNER).by(A_VOTER)
      await vote(WINNER).by(AN_OTHER_VOTER)
      let voted = Number(await votedCount().of(A_PROPOSAL))
    }).should.be.rejected()
  })

  it('...should give chairmain 2 vote weight', async () => {
    await vote(WINNER).by(A_VOTER)
    await vote(WINNER).by(AN_OTHER_VOTER)
    await vote(WINNER).by(CHAIR)
    await finishes().by(CHAIR)
    let voted = Number(await votedCount().of(A_PROPOSAL))
    assert.strictEqual(voted, 4)
  })
})