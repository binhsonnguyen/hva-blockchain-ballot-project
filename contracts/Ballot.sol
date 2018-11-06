pragma solidity 0.4.24;


contract Ballot {
  address private _chairman;
  uint public startTime;
  uint public registerDeadline;
  uint public votingDeadline;

  mapping(address => bool) private _voters;

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
    require(now <= registerDeadline);
    _;
  }

  modifier inVoteTime() {
    require(registerDeadline < now && now <= votingDeadline);
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
