const Ballot = artifacts.require('./Ballot.sol')

const Register = require('./libs/register.js')
const Vote = require('./libs/vote.js')
const Nominate = require('./libs/nominate.js')
const attempt = require('./libs/attempt.js')

const log = console.log

const A_PROPOSAL = 'WINNER' // 0x57494e4e4552
const ANOTHER_PROPOSAL = 'LOSSER' // 0x4c4f53534552

contract('ballot/preparing', accounts => {
  const CHAIR = accounts[0]
  const A_VOTER = accounts[1]
  const AN_OTHER_VOTER = accounts[2]

  let contract = null
  let register = null
  let nominate = null
  let vote = null

  beforeEach(async () => {
    contract = await Ballot.new()
    register = Register(contract)
    nominate = Nominate(contract)
    vote = Vote(contract)
  })

  it('...should reject chairman attempt registering', async () => {
    await attempt(async () => {
      await register(A_VOTER).by(CHAIR)
    }).should.be.rejected()
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
})
