const Ballot = artifacts.require('./Ballot.sol')

contract('Ballot', accounts => {
  const CHAIR = 0
  const A_VOTER = 1
  const AN_OTHER_VOTER = 2

  let contract

  let register = to => ({by: by => contract.register(accounts[to], {from: accounts[by]})})

  beforeEach(async () => {
    contract = await Ballot.deployed()
  })

  it('...should let chairman registering a voter', async () => {
    try {
      await register(A_VOTER).by(CHAIR)
      assert.ok('voter has been registered successfully')
    } catch (e) {
      console.log(e)
      assert.fail()
    }
  })

  it('...should reject registering request from otherman', async () => {
    try {
      await register(A_VOTER).by(AN_OTHER_VOTER)
    } catch (e) {
      assert.ok(e, 'registering request has been rejected')
      return
    }
    assert.fail()
  })
})
