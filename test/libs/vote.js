module.exports = contract => proposal => ({by: by => contract.vote(proposal, {from: by})})