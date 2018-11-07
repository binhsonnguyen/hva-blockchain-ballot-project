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
    bool nominated;
    uint vote;
  }

  mapping(address => bool) private _voters;

  mapping(bytes32 => Proposal) private _nominated;
  bytes32[] public proposals;

  event Nominated(bytes32 proposal);
  event Registered(address voter);

  modifier notNominated(bytes32 name) {
    require(!_nominated[name].nominated);
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

  function nominate(bytes32 proposal) public onlyChairman inPreparingTime notNominated(proposal) {
    _nominated[proposal].nominated = true;
    _nominated[proposal].vote = 0;
    proposals.push(proposal);
    emit Nominated(proposal);
  }

  function register(address voter) public onlyChairman inRegisteringTime neverVoted(voter) {
    _voters[voter] = false;
    emit Registered(voter);
  }
}
