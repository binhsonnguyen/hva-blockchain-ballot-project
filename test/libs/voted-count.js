module.exports = contract => () => ({of: proposal => contract.votedCount.call(proposal)})