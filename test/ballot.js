const Ballot = artifacts.require('./Ballot.sol')

contract('Ballot', accounts => {
  let contract;

  beforeEach(async () => {
    contract = await Ballot.deployed()
  })

  it('...should be initialized', async () => {
    try {
      assert.ok(contract, 'it was initialized')
    } catch (e) {
      assert.fail()
    }
  })

  it('...should let chairman registering a voter', async () => {
    try {
      await contract.register(accounts[1], {from: accounts[0]})
      assert.ok('voter has been registered successfully')
    } catch (e) {
      console.log(e)
      assert.fail()
    }
  })

  it('...should reject registering request from otherman', async () => {
    try {
      await contract.register(accounts[2], {from: accounts[1]})
    } catch (e) {
      assert.ok(e, 'registering request has been rejected')
      return
    }
    assert.fail()
  })
})
