var Ballot = artifacts.require("./SeekableBallot.sol");

module.exports = function(deployer) {
  deployer.deploy(Ballot);
};
