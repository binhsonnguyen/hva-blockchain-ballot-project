var Ballot = artifacts.require("./BallotWithTimeTravelAbility.sol");

module.exports = function(deployer) {
  deployer.deploy(Ballot);
};
