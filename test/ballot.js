const BallotRegistering = artifacts.require('./Ballot.sol')
const attempt = require('./attempt.js')

contract('ballot/voting', accounts => {
  const CHAIR = 0
  const A_VOTER = 1
  const AN_OTHER_VOTER = 2
  const A_PROPOSAL = 0
  const ANOTHER_PROPOSAL = 0

  let contract = null

  let register = to => ({by: by => contract.register(accounts[to], {from: accounts[by]})})
  let vote = proposal => ({by: by => contract.vote(proposal, {from: accounts[by]})})

  beforeEach(async () => {
    contract = await BallotRegistering.deployed()
  })

  it('...should let chairman registering', async () => {
    attempt(async () => await register(A_VOTER).by(CHAIR))
      .should.succeed()
  })

  it('...should reject others registering', async () => {
    attempt(async () => await register(A_VOTER).by(AN_OTHER_VOTER))
      .should.rejected()
  })

  it('...should reject chairman register a voted voter', async () => {
    attempt(async () => {
      await register(A_VOTER).by(CHAIR)
      await vote(A_PROPOSAL).by(A_VOTER)
      await register(A_VOTER).by(CHAIR)
    })
      .should.rejected()
  })

  it('...should let registered voter do vote', async () => {
    attempt(async () => {
      await register(A_VOTER).by(CHAIR)
      await vote(A_PROPOSAL).by(A_VOTER)
    }).should.succeed()
  })

  it('...should reject re-vote', async () => {
    attempt(async () => {
      await register(A_VOTER).by(CHAIR)
      await vote(A_PROPOSAL).by(A_VOTER)
      await vote(ANOTHER_PROPOSAL).by(A_VOTER)
    })
      .should.rejected()
  })
})
