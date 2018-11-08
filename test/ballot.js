const Ballot = artifacts.require('./Ballot.sol')

const Nominate = require('./libs/nominate.js')
const Register = require('./libs/register.js')
const Vote = require('./libs/vote.js')
const attempt = require('./libs/attempt.js')

const log = console.log

const A_PROPOSAL = 'WINNER' // 0x57494e4e4552
const ANOTHER_PROPOSAL = 'LOOSER' // 0x4c4f4f534552

contract('ballot/preparing', accounts => {
  const CHAIR = accounts[0]
  const A_VOTER = accounts[1]
  const AN_OTHER_VOTER = accounts[2]

  let contract = null
  let nominate = null
  let register = null

  beforeEach(async () => {
    contract = await Ballot.new()
    nominate = Nominate(contract)
    register = Register(contract)
  })

  it('...should reject others registering', async () => {
    await attempt(async () => {
      await register(A_VOTER).by(AN_OTHER_VOTER)
    }).should.be.rejected()
  })

  it('...should let chairman add proposals', async () => {
    await attempt(async () => {
      await nominate(A_PROPOSAL).by(CHAIR)
    }).should.be.succeed()
  })

  it('...should let people get proposals count', async () => {
    await nominate(A_PROPOSAL).by(CHAIR)
    await nominate(ANOTHER_PROPOSAL).by(CHAIR)
    let expected = 2
    let actual = Number(await contract.proposalsCount.call())
    assert.strictEqual(actual, expected)
  })

  it('...should let people get proposals name', async () => {
    await nominate(A_PROPOSAL).by(CHAIR)
    let expected = web3.fromUtf8(A_PROPOSAL)
    let result = await contract.proposals.call(0)
    assert.ok(result.startsWith(expected))

    await nominate(ANOTHER_PROPOSAL).by(CHAIR)
    let anOtherExpected = web3.fromUtf8(ANOTHER_PROPOSAL)
    let anOtherResult = await contract.proposals.call(1)
    assert.ok(anOtherResult.startsWith(anOtherExpected))
  })

  it('...should let chairman start ballot pharse', async () => {
    await attempt(async () => {
      await nominate(A_PROPOSAL).by(CHAIR)
      await nominate(ANOTHER_PROPOSAL).by(CHAIR)
      await contract.start()
    }).should.be.succeed()
  })

  it('...should reject chairman start ballot pharse if at least two proposal nominated', async () => {
    await attempt(async () => {
      await nominate(A_PROPOSAL).by(CHAIR)
      await contract.start()
    }).should.be.rejected()
  })

  it('...should let chairman register a voter', async () => {
    await attempt(async () => {
      await register(A_VOTER).by(CHAIR)
    }).should.be.succeed()
  })
})
