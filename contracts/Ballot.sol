pragma solidity 0.4.24;


contract Ballot {
  address private _chairman;

  enum Stage {
    Preparing,
    Registering,
    Voting,
    Finished
  }

  mapping(address => bool) private _voters;
  Stage private _stage;

  event Registered(address voter);

  modifier onlyChairman() {
    require(msg.sender == _chairman);
    _;
  }

  modifier neverVoted(address voter) {
    require(!_voters[voter]);
    _;
  }

  modifier inRegTime() {
    _;
  }

  modifier inVoteTime() {
    _;
  }

  constructor () public {
    _chairman = msg.sender;
    startTime = now;
    registerDeadline = now + 5 seconds;
    votingDeadline = now + 10 seconds;
  }

  function register(address voter) public onlyChairman inRegTime neverVoted(voter) {
    _voters[voter] = false;
    emit Registered(voter);
  }

  function vote(uint proposal) public inVoteTime neverVoted(msg.sender) {
    _voters[msg.sender] = true;
  }
}
