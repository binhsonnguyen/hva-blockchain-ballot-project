const Ballot = artifacts.require('./BallotWithTimeTravelAbility.sol')

const Register = require('./libs/register.js')
const Vote = require('./libs/vote.js')
const TimeTraveller = require('./libs/time-traveller')
const attempt = require('./libs/attempt.js')

const log = console.log

const A_PROPOSAL = 0
const ANOTHER_PROPOSAL = 1
const SECOND = 1
const REGISTER_DURATION = 5 * SECOND
const A_LITTLE_BIT_TIME = 1 * SECOND

contract('ballot/registering', accounts => {
  const CHAIR = accounts[0]
  const A_VOTER = accounts[1]
  const AN_OTHER_VOTER = accounts[2]

  let contract = null
  let register = null
  let vote = null
  let travelTime = null

  beforeEach(async () => {
    contract = await Ballot.new(accounts[CHAIR])
    register = Register(contract)
    vote = Vote(contract)
    travelTime = TimeTraveller(contract)
  })

  it('...should let chairman attempt registering', async () => {
    await attempt(async () => {
      await register(A_VOTER).by(CHAIR)
    }).should.be.succeed()
  })

  it('...should let chairman attempt registering in time', async () => {
    await attempt(async () => {
      await travelTime(REGISTER_DURATION)
      await register(A_VOTER).by(CHAIR)
    }).should.be.succeed()
  })

  it('...should reject others registering', async () => {
    await attempt(async () => {
      await register(A_VOTER).by(AN_OTHER_VOTER)
    }).should.be.rejected()
  })

  it('...should reject voter do vote in early time', async () => {
    await attempt(async () => {
      await register(A_VOTER).by(CHAIR)
      await vote(A_PROPOSAL).by(A_VOTER)
    }).should.be.rejected()
  })

  it('...should reject voter do vote in early time', async () => {
    await attempt(async () => {
      await register(A_VOTER).by(CHAIR)
      await travelTime(REGISTER_DURATION)
      await vote(A_PROPOSAL).by(A_VOTER)
    }).should.be.rejected()
  })
})

contract('ballot/voting', accounts => {
  const CHAIR = accounts[0]
  const A_VOTER = accounts[1]
  const AN_OTHER_VOTER = accounts[2]

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
    await attempt(async () => {
      await travelTime(REGISTER_DURATION + A_LITTLE_BIT_TIME)
      await register(A_VOTER).by(CHAIR)
    }).should.be.rejected()
  })

  it('...should let registered voter do vote when in time', async () => {
    await attempt(async () => {
      await register(AN_OTHER_VOTER).by(CHAIR)
      await travelTime(REGISTER_DURATION + A_LITTLE_BIT_TIME)
      await vote(A_PROPOSAL).by(A_VOTER)
    }).should.be.succeed()
  })

  it('...should reject re-vote', async () => {
    await attempt(async () => {
      await register(A_VOTER).by(CHAIR)
      await travelTime(REGISTER_DURATION + A_LITTLE_BIT_TIME)
      await vote(A_PROPOSAL).by(A_VOTER)
      await vote(ANOTHER_PROPOSAL).by(A_VOTER)
    }).should.be.rejected()
  })
})