pragma solidity ^0.4.25;

import "./base/TokenCappedCrowdsale.sol";
import "./base/TimedBonusCrowdsale.sol";

contract FidelityHouseICO is TokenCappedCrowdsale, TimedBonusCrowdsale {

  constructor(
    uint256 _openingTime,
    uint256 _closingTime,
    uint256 _rate,
    address _wallet,
    uint256 _tokenCap,
    uint256 _minimumContribution,
    address _token,
    address _contributions,
    uint256 _tierZero
  )
    DefaultICO(
      _openingTime,
      _closingTime,
      _rate,
      _wallet,
      _minimumContribution,
      _token,
      _contributions,
      _tierZero
    )
    TokenCappedCrowdsale(_tokenCap)
    public
  {}

  function adjustTokenCap(uint256 _newTokenCap) external onlyOwner {
    require(_newTokenCap > 0, "Token Cap should be greater than zero");

    tokenCap = _newTokenCap;
  }

  // false if the ico is not started, false if the ico is started and running, true if the ico is completed
  function ended() public view returns(bool) {
    return hasClosed() || tokenCapReached();
  }
}
