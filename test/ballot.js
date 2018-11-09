const Ballot = artifacts.require('./Ballot.sol')

const Nominate = require('./libs/nominate.js')
const Register = require('./libs/register.js')
const Start = require('./libs/start.js')
const Finish = require('./libs/finishes.js')
const Vote = require('./libs/vote.js')
const attempt = require('./libs/attempt.js')

const log = console.log

const A_PROPOSAL = 'WINNER' // 0x57494e4e4552
const ANOTHER_PROPOSAL = 'LOOSER' // 0x4c4f4f534552
const WINNER = 0 // 0x4c4f4f534552
const LOOSER = 1 // 0x4c4f4f534552

contract('ballot, given when preparing, it...', accounts => {
  const CHAIR = accounts[0]
  const A_VOTER = accounts[1]
  const AN_OTHER_VOTER = accounts[2]

  let contract = null
  let nominate = null
  let register = null
  let start = null
  let finishes = null

  beforeEach(async () => {
    contract = await Ballot.new()
    nominate = Nominate(contract)
    register = Register(contract)
    start = Start(contract)
    finishes = Finish(contract)
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
    await contract.start()
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
})
