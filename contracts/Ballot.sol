pragma solidity 0.4.24;


contract Ballot {
  address private chairman;

  mapping (address => bool) private _voters;

  event Registered(address voter);

  constructor () public {
  }

  function register(address voter) public {
    _voters[voter] = false;
    emit Registered(voter);
  }
}
