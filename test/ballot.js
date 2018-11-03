const Ballot = artifacts.require('./Ballot.sol')

contract('Ballot', accounts => {
  const CHAIR = 0
  const A_VOTER = 1
  const AN_OTHER_VOTER = 2
  const A_PROPOSAL = 0
  const ANOTHER_PROPOSAL = 0

  let contract = null

  let log = (...msg) => console.log(msg)
  let register = to => ({by: by => contract.register(accounts[to], {from: accounts[by]})})
  let vote = proposal => ({by: by => contract.vote(proposal, {from: accounts[by]})})
  let given = asyncAction => ({
    reject: {
      orFailed: async () => {
        try {
          await asyncAction()
        } catch (e) {
          assert.ok(true)
          return
        }
        assert.fail()
      }
    },
    orFailed: async () => {
      try {
        await asyncAction()
        assert.ok(true)
      } catch (e) {
        log(e)
        assert.fail()
      }
    }
  })

  beforeEach(async () => {
    contract = await Ballot.deployed()
  })

  it('...should let chairman registering a voter', async () => {
    given(async () => await register(A_VOTER).by(CHAIR)).orFailed()
  })

  it('...should reject registering request from otherman', async () => {
    given(async () => await register(A_VOTER).by(AN_OTHER_VOTER))
      .reject.orFailed()
  })

  it('...should let registered voter do vote', async () => {
    given(async () => {
      await register(A_VOTER).by(CHAIR)
      await vote(A_PROPOSAL).by(A_VOTER)
    }).orFailed()
  })

  it('...should reject voted voter do vote again', async () => {
    given(async () => {
      await register(A_VOTER).by(CHAIR)
      await vote(A_PROPOSAL).by(A_VOTER)
      await vote(ANOTHER_PROPOSAL).by(A_VOTER)
    })
      .reject.orFailed()
  })

  it('...should reject chairman register a voted voter', async () => {
    given(async () => {
      await register(A_VOTER).by(CHAIR)
      await vote(A_PROPOSAL).by(A_VOTER)
      await register(A_VOTER).by(CHAIR)
    })
      .reject.orFailed()
  })
})
