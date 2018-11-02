const Ballot = artifacts.require('./Ballot.sol')

contract('Ballot', accounts => {
  const CHAIR = 0
  const A_VOTER = 1
  const AN_OTHER_VOTER = 2
  const A_PROPOSAL = 0
  const ANOTHER_PROPOSAL = 0

  let contract = null

  let register = to => ({by: by => contract.register(accounts[to], {from: accounts[by]})})
  let vote = proposal => ({by: by => contract.vote(proposal, {from: accounts[by]})})

  beforeEach(async () => {
    contract = await Ballot.deployed()
  })

  it('...should let chairman registering a voter', async () => {
    try {
      await register(A_VOTER).by(CHAIR)
      assert.ok(true)
    } catch (e) {
      console.log(e)
      assert.fail()
    }
  })

  it('...should reject registering request from otherman', async () => {
    try {
      await register(A_VOTER).by(AN_OTHER_VOTER)
    } catch (e) {
      assert.ok(true)
      return
    }
    assert.fail()
  })

  it('...should let registered voter do vote', async () => {
    try {
      await register(A_VOTER).by(CHAIR)
      await vote(A_PROPOSAL).by(A_VOTER)
      assert.ok(true)
    } catch (e) {
      console.log(e)
      assert.fail()
    }
  })

  it('...should reject voted voter do vote again', async () => {
    try {
      await register(A_VOTER).by(CHAIR)
      await vote(A_PROPOSAL).by(A_VOTER)
      await vote(ANOTHER_PROPOSAL).by(A_VOTER)
    } catch (e) {
      assert.ok(true)
      return
    }
    assert.fail()
  })
})
