module.exports = contract => to => ({by: by => contract.register(to, {from: by})})