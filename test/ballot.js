const BallotRegistering = artifacts.require('./Ballot.sol')
const sinon = require('sinon')

const CHAIR = 0
const A_VOTER = 1
const AN_OTHER_VOTER = 2
const A_PROPOSAL = 0
const ANOTHER_PROPOSAL = 0

contract('ballot/registering', accounts => {
  let contract = null
  let clock = null

  let register = to => ({by: by => contract.register(accounts[to], {from: accounts[by]})})
  let vote = proposal => ({by: by => contract.vote(proposal, {from: accounts[by]})})

  beforeEach(async function () {
    contract = await BallotRegistering.deployed()
    clock = sinon.useFakeTimers()
  })

  afterEach(async () => {
    clock.restore()
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
      clock.tick(2000)
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
      console.log("BUG", e)
      assert.ok(true)
      return
    }
    assert.fail()
  })
})

contract('ballot/voting', accounts => {
  let contract = null
  let clock = null

  let register = to => ({by: by => contract.register(accounts[to], {from: accounts[by]})})
  let vote = proposal => ({by: by => contract.vote(proposal, {from: accounts[by]})})

  beforeEach(async function () {
    this.timeout(4000) // increase mocha unit test's timeout limit
    contract = await BallotRegistering.deployed()
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    clock.restore()
  })

  it('should reject registering when time over', async () => {
    try {
      clock.tick(5000)
      await register(A_VOTER).by(CHAIR)
    } catch (e) {
      assert.ok(true)
      return
    }
    assert.fail()
  })

  it('...should let registered voter do vote when in time', async () => {
    try {
      await register(A_VOTER).by(CHAIR)
      clock.tick(5000)
      await vote(A_PROPOSAL).by(A_VOTER)
      assert.ok(true)
    } catch (e) {
      assert.fail()
    }
  })

  it('...should reject re-vote', async () => {
    try {
      await register(A_VOTER).by(CHAIR)
      clock.tick(5000)
      await vote(A_PROPOSAL).by(A_VOTER)
      await vote(ANOTHER_PROPOSAL).by(A_VOTER)
    } catch (e) {
      assert.ok(true)
      return
    }
    assert.fail()
  })
})