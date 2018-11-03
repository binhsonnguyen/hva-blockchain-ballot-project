const Ballot = artifacts.require('./SeekableBallot.sol')
const Register = require('./register.js')
const Vote = require('./vote.js')
const TimeTraveller = require('./time-traveller')
const attempt = require('./attempt.js')

const log = console.log

const CHAIR = 0
const A_VOTER = 1
const AN_OTHER_VOTER = 2
const A_PROPOSAL = 0
const ANOTHER_PROPOSAL = 0

const SECOND = 1
const REGISTER_DURATION = 5 * SECOND

contract('ballot/registering', accounts => {
  let contract = null
  let register = null
  let vote = null
  let travelTime = null

  beforeEach(async () => {
    contract = await Ballot.new(accounts[CHAIR])
    register = Register(contract, accounts)
    vote = Vote(contract, accounts)
    travelTime = TimeTraveller(contract)
  })

  it('...should let chairman attempt registering', async () => {
    attempt(async () => {
      await register(A_VOTER).by(CHAIR)
    })
      .should.be.succeed()
  })

  it('...should let chairman attempt registering in time', async () => {
    attempt(async () => {
      await travelTime(2 * SECOND)
      await register(A_VOTER).by(CHAIR)
    }).should.be.succeed()
  })

  it('...should reject others registering', async () => {
    attempt(async () => {
      await register(A_VOTER).by(AN_OTHER_VOTER)
    }).should.be.rejected()
  })

  it('...should reject voter do vote in early time', async () => {
    attempt(async () => {
      await register(A_VOTER).by(CHAIR)
      await vote(A_PROPOSAL).by(A_VOTER)
    }).should.be.rejected()
  })
})

contract('ballot/voting', accounts => {
  let contract = null
  let register = null
  let vote = null
  let travelTime = null

  beforeEach(async () => {
    contract = await Ballot.new(accounts[CHAIR])
    register = Register(contract, accounts)
    vote = Vote(contract, accounts)
    travelTime = TimeTraveller(contract)
  })

  it('should reject registering when time over', async () => {
    attempt(async () => {
      await travelTime(REGISTER_DURATION + 1)
      await register(A_VOTER).by(CHAIR)
    }).should.be.rejected()
  })

  it('...should let registered voter do vote when in time', async () => {
    attempt(async () => {
      await register(AN_OTHER_VOTER).by(CHAIR)
      await travelTime(REGISTER_DURATION + 1)
      await vote(A_PROPOSAL).by(A_VOTER)
    }).should.be.succeed()
  })

  it('...should reject re-vote', async () => {
    attempt(async () => {
      await register(A_VOTER).by(CHAIR)
      await travelTime(REGISTER_DURATION + 1)
      await vote(A_PROPOSAL).by(A_VOTER)
      await vote(ANOTHER_PROPOSAL).by(A_VOTER)
    }).should.be.rejected()
  })
})