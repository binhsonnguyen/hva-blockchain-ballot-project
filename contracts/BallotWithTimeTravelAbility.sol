pragma solidity 0.4.24;

import "./Ballot.sol";


contract BallotWithTimeTravelAbility is Ballot {
  function travelTime(uint time) public {
    startTime -= time;
    registerDeadline -= time;
  }
}
