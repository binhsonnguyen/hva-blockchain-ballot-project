const Ballot = artifacts.require('./Ballot.sol')

contract('Ballot', accounts => {
  it('...should be initialized', async () => {
    try {
      const simpleStorageInstance = await Ballot.deployed()
      assert.ok(true, "it was initialized")
    } catch (e) {
      assert.fail()
    }

  })
})
