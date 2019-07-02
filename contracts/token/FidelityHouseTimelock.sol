pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/token/ERC20/TokenTimelock.sol";

contract FidelityHouseTimelock is TokenTimelock {
  constructor(
    ERC20Basic _token,
    address _beneficiary,
    uint256 _releaseTime
  )
    TokenTimelock(_token, _beneficiary, _releaseTime)
    public
  {}
}
