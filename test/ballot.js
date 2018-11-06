const Ballot = artifacts.require('./Ballot.sol')

const Register = require('./libs/register.js')
const Vote = require('./libs/vote.js')
const attempt = require('./libs/attempt.js')

const log = console.log

const A_PROPOSAL = 0
const ANOTHER_PROPOSAL = 1

contract('ballot/preparing', accounts => {
  const CHAIR = accounts[0]
  const A_VOTER = accounts[1]
  const AN_OTHER_VOTER = accounts[2]

  let contract = null
  let register = null
  let vote = null

  beforeEach(async () => {
    contract = await Ballot.new()
    register = Register(contract)
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
})
