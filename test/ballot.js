const Ballot = artifacts.require('./Ballot.sol')

contract('Ballot', accounts => {
  it('...should be initialized', async () => {
    try {
      const ballotInstance = await Ballot.deployed()
      assert.ok(true, "it was initialized")
    } catch (e) {
      assert.fail()
    }
  })

  it('...should let chairman registering a voter', async () => {
    try {
      const contract = await Ballot.deployed();
      await contract.register(accounts[1], {from: accounts[0]})
      assert.ok("voter has been registered successfully")
    } catch (e) {
      console.log(e)
      assert.fail()
    }
  })

  it('...should reject registering request from otherman', async () => {
    const contract = await Ballot.deployed();
    await contract.register(accounts[2], {from: accounts[1]})
    assert.fail()
  })
})
