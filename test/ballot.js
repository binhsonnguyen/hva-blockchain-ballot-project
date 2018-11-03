const Ballot = artifacts.require('./SeekableBallot.sol')
const Register = require('./register.js')
const Vote = require('./vote.js')
const TimeTraveller = require('./time-traveller')

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
    try {
      await register(A_VOTER).by(CHAIR)
    } catch (e) {
      assert.fail()
      return
    }
  })

  it('...should let chairman attempt registering in time', async () => {
    try {
      await travelTime(2 * SECOND)
      await register(A_VOTER).by(CHAIR)
    } catch (e) {
      assert.fail()
    }
  })

  it('...should reject others registering', async () => {
    try {
        await register(A_VOTER).by(AN_OTHER_VOTER)
    } catch (e) {
      assert.ok(true)
      return
    }
    assert.fail()
  })

  it('...should reject voter do vote in early time', async () => {
    try {
      await register(A_VOTER).by(CHAIR)
      await vote(A_PROPOSAL).by(A_VOTER)
    } catch (e) {
      assert.ok(true)
      return
    }
    assert.fail()
  })
})

contract('ballot/voting', accounts => {
  let contract = null
  let register = null
  let vote = null
  let travelTime = null

  beforeEach(async () => {
    contract = await Ballot.new(accounts[CHAIR])
    // contract = await Ballot.deployed()
    register = Register(contract, accounts)
    vote = Vote(contract, accounts)
    travelTime = TimeTraveller(contract)
  })

  it('should reject registering when time over', async () => {
    try {
      await travelTime(REGISTER_DURATION + 1)
      await register(A_VOTER).by(CHAIR)
    } catch (e) {
      assert.ok(true)
      return
    }
    assert.fail()
  })

  it('...should let registered voter do vote when in time', async () => {
    try {
      await register(AN_OTHER_VOTER).by(CHAIR)
      // await travelTime(REGISTER_DURATION + 1)
      // await vote(A_PROPOSAL).by(A_VOTER)
      // assert.ok(true)
    } catch (e) {
      log(e.toString())
      e.toString()
      for (p in e) log('---p', p)
      // for (p of e) log('---p', p)
      assert.fail()
    }
  })

  it('...should reject re-vote', async () => {
    try {
      await register(A_VOTER).by(CHAIR)
      await travelTime(REGISTER_DURATION + 1)
      await vote(A_PROPOSAL).by(A_VOTER)
      await vote(ANOTHER_PROPOSAL).by(A_VOTER)
    } catch (e) {
      assert.ok(true)
      return
    }
    assert.fail()
  })
})