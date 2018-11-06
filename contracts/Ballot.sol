pragma solidity 0.4.24;


contract Stageable {
  enum Stage {
    Preparing,
    Registering,
    Voting,
    Finished
  }

  Stage internal _stage;

  modifier inPreparingTime() {
    require(_stage == Stage.Preparing);
    _;
  }

  modifier inRegisteringTime() {
    require(_stage == Stage.Registering);
    _;
  }

  modifier inVoteTime() {
    require(_stage == Stage.Voting);
    _;
  }

  modifier finished() {
    require(_stage == Stage.Finished);
    _;
  }

}


contract OwnedByChairman {
  address internal _chairman;

  modifier onlyChairman() {
    require(msg.sender == _chairman);
    _;
  }
}


contract Ballot is Stageable, OwnedByChairman {
  struct Proposal {
    bool registered;
    uint vote;
    bytes32 name;
  }

  mapping(address => bool) private _voters;

  Proposal[] public proposals;

  event Registered(address voter);

  modifier notRegistered(bytes32 name) {
    for (uint i = 0; i < proposals.length; i++) {
      if (proposals[i].name == name) revert();
    }
    _;
  }

  modifier neverVoted(address voter) {
    require(!_voters[voter]);
    _;
  }

  constructor () public {
    _chairman = msg.sender;
    _stage = Stage.Preparing;
  }

  function addProposal(bytes32 name) public onlyChairman inPreparingTime notRegistered(name) {
    proposals[proposals.length].name = name;
    proposals[proposals.length].registered = true;
  }

  function register(address voter) public onlyChairman inRegisteringTime neverVoted(voter) {
    _voters[voter] = false;
    emit Registered(voter);
  }
}
