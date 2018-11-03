const Ballot = artifacts.require('./SeekableBallot.sol')

const Register = require('./libs/register.js')
const Vote = require('./libs/vote.js')
const TimeTraveller = require('./libs/time-traveller')
const attempt = require('./libs/attempt.js')

const log = console.log

const A_PROPOSAL = 0
const ANOTHER_PROPOSAL = 1
const SECOND = 1
const REGISTER_DURATION = 5 * SECOND

let chair
let aVoter
let anOtherVoter

contract('ballot/registering', accounts => {
  let contract = null
  let register = null
  let vote = null
  let travelTime = null

  before(() => {
    chair = accounts[0]
    aVoter = accounts[1]
    anOtherVoter = accounts[2]
  })

  beforeEach(async () => {
    contract = await Ballot.new(accounts[chair])
    register = Register(contract)
    vote = Vote(contract)
    travelTime = TimeTraveller(contract)
  })

  it('...should let chairman attempt registering', async () => {
    attempt(async () => {
      await register(aVoter).by(chair)
    }).should.be.succeed()
  })

  it('...should let chairman attempt registering in time', async () => {
    attempt(async () => {
      await travelTime(2 * SECOND)
      await register(aVoter).by(chair)
    }).should.be.succeed()
  })

  it('...should reject others registering', async () => {
    attempt(async () => {
      await register(aVoter).by(anOtherVoter)
    }).should.be.rejected()
  })

  it('...should reject voter do vote in early time', async () => {
    attempt(async () => {
      await register(aVoter).by(chair)
      await vote(A_PROPOSAL).by(aVoter)
    }).should.be.rejected()
  })
})

contract('ballot/voting', accounts => {
  let contract = null
  let register = null
  let vote = null
  let travelTime = null

  before(() => {
    chair = accounts[0]
    aVoter = accounts[1]
    anOtherVoter = accounts[2]
  })

  beforeEach(async () => {
    contract = await Ballot.new(accounts[chair])
    register = Register(contract, accounts)
    vote = Vote(contract, accounts)
    travelTime = TimeTraveller(contract)
  })

  it('should reject registering when time over', async () => {
    attempt(async () => {
      await travelTime(REGISTER_DURATION + 1)
      await register(aVoter).by(chair)
    }).should.be.rejected()
  })

  it('...should let registered voter do vote when in time', async () => {
    attempt(async () => {
      await register(anOtherVoter).by(chair)
      await travelTime(REGISTER_DURATION + 1)
      await vote(A_PROPOSAL).by(aVoter)
    }).should.be.succeed()
  })

  it('...should reject re-vote', async () => {
    attempt(async () => {
      await register(aVoter).by(chair)
      await travelTime(REGISTER_DURATION + 1)
      await vote(A_PROPOSAL).by(aVoter)
      await vote(ANOTHER_PROPOSAL).by(aVoter)
    }).should.be.rejected()
  })
})