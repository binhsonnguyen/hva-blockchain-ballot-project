const Ballot = artifacts.require('./Ballot.sol')

contract('Ballot', accounts => {
  let contract

  beforeEach(async () => {
    contract = await Ballot.deployed()
  })

  it('...should let chairman registering a voter', async () => {
    try {
      await register(accounts[1]).by(accounts[0])
      assert.ok('voter has been registered successfully')
    } catch (e) {
      console.log(e)
      assert.fail()
    }
  })

  it('...should reject registering request from otherman', async () => {
    try {
      await register(accounts[2]).by(accounts[1])
    } catch (e) {
      assert.ok(e, 'registering request has been rejected')
      return
    }
    assert.fail()
  })

  function register (to) {
    return {
      by: function (by) {
        return contract.register(to, {from: by})
      }
    }
  }
})
