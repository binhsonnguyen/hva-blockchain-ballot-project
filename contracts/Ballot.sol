pragma solidity 0.4.24;


contract Ballot {
  address private _chairman;

  mapping (address => bool) private _voters;

  event Registered(address voter);

  modifier onlyChairman() {
    require(msg.sender == _chairman);
    _;
  }

  constructor () public {
    _chairman = msg.sender;
  }

  function register(address voter) public onlyChairman {
    _voters[voter] = false;
    emit Registered(voter);
  }
}
