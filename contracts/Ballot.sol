pragma solidity 0.4.24;


contract Ballot {
  address private _chairman;

  mapping (address => bool) private _voters;

  event Registered(address voter);

  modifier onlyChairman() {
    require(msg.sender == _chairman);
    _;
  }

  modifier neverVoted(address voter) {
    require(!_voters[voter]);
    _;
  }

  constructor () public {
    _chairman = msg.sender;
  }

  function register(address voter) public onlyChairman {
    _voters[voter] = false;
    emit Registered(voter);
  }

  function vote(uint proposal) public neverVoted(msg.sender) {
    _voters[msg.sender] = true;
  }
}
