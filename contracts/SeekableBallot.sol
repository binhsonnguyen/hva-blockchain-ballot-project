pragma solidity 0.4.24;

import "./Ballot.sol";


contract SeekableBallot is Ballot {
  function travelTime(uint time) public {
    startTime -= time;
    registerDeadline -= time;
  }
}
