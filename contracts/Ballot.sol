pragma solidity ^0.4.24;


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
    require(_isChairman(msg.sender));
    _;
  }

  function _isChairman(address people) internal view returns (bool) {
    return _chairman == people;
  }
}


contract Nominateable is Stageable, OwnedByChairman {
  struct Proposal {
    bool nominated;
    uint vote;
  }

  mapping(bytes32 => Proposal) internal _nominated;
  bytes32[] public proposals;

  event Nominated(bytes32 proposal);

  modifier notNominated(bytes32 name) {
    require(!_nominated[name].nominated);
    _;
  }

  modifier atLeastTwoProposalNominated () {
    require(proposalsCount() >= 2);
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

  function votedCount(bytes32 proposal) public finished view returns (uint) {
    return _nominated[proposal].vote;
  }
}


contract Registrable is Stageable, OwnedByChairman {
  struct Voter {
    bool registered;
    bool voted;
  }

  mapping(address => Voter) internal _voters;
  uint public votersCount;
  uint public votesCount;

  event Registered(uint votersCount);

  modifier registered(address voter) {
    require(_voters[voter].registered);
    _;
  }

  modifier neverRegistered(address voter) {
    require(!_voters[voter].registered);
    _;
  }

  modifier neverVoted(address voter) {
    require(!_voters[voter].voted);
    _;
  }

  modifier atLeastAHalfVoted() {
    require(votesCount > 0 && votersCount / votesCount <= 2);
    _;
  }

  function register(address voter) public onlyChairman inPreparingTime neverRegistered(voter) neverVoted(voter) {
    _voters[voter].registered = true;
    _voters[voter].voted = false;
    votersCount++;
    emit Registered(votersCount);
  }
}


contract Ballot is Nominateable, Registrable {
  event Started();
  event Finished();

  constructor () public {
    _chairman = msg.sender;
    _stage = Stage.Preparing;
  }

  function start() public onlyChairman atLeastTwoProposalNominated {
    _stage = Stage.Voting;
    emit Started();
  }

  function finish() public onlyChairman inVoteTime atLeastAHalfVoted {
    _stage = Stage.Finished;
    emit Finished();
  }

  function vote(uint order) public inVoteTime registered(msg.sender) neverVoted(msg.sender) {
    _voters[msg.sender].voted = true;
    _nominated[proposals[order]].vote += _isChairman(msg.sender) ? 2 : 1;
    votesCount++;
  }
}
