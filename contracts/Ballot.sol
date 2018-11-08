pragma solidity 0.4.24;


contract Stageable {
  enum Stage {
    Preparing,
    Voting,
    Finished
  }

  Stage internal _stage;

  modifier inPreparingTime() {
    require(_stage == Stage.Preparing);
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


contract Nominateable is Stageable, OwnedByChairman {
  struct Proposal {
    bool nominated;
    uint vote;
  }

  mapping(bytes32 => Proposal) private _nominated;
  bytes32[] public proposals;

  event Nominated(bytes32 proposal);

  modifier notNominated(bytes32 name) {
    require(!_nominated[name].nominated);
    _;
  }

  function proposalsCount() public view returns (uint) {
    return proposals.length;
  }

  function nominate(bytes32 proposal) public onlyChairman inPreparingTime notNominated(proposal) {
    _nominated[proposal].nominated = true;
    _nominated[proposal].vote = 0;
    proposals.push(proposal);
    emit Nominated(proposal);
  }
}


contract Registrable is Stageable, OwnedByChairman {
  struct Voter {
    bool registered;
    bool voted;
  }

  mapping(address => Voter) private _voters;

  event Registered(address voter);

  modifier neverRegistered(address voter) {
    require(!_voters[voter].registered);
    _;
  }

  modifier neverVoted(address voter) {
    require(!_voters[voter].voted);
    _;
  }

  function register(address voter) public onlyChairman inPreparingTime neverRegistered(voter) neverVoted(voter) {
    _voters[voter].registered = true;
    _voters[voter].voted = false;
    emit Registered(voter);
  }
}


contract Ballot is Nominateable, Registrable {
  modifier atLeastTwoProposalNominated () {
    require(proposalsCount() >= 2);
    _;
  }

  constructor () public {
    _chairman = msg.sender;
    _stage = Stage.Preparing;
  }

  function start() public atLeastTwoProposalNominated {
    _stage = Stage.Voting;
  }
}
