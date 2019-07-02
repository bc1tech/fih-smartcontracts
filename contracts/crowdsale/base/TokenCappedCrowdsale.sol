pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";

/**
 * @title TokenCappedCrowdsale
 * @dev Crowdsale with a limited amount of tokens to be sold
 */
contract TokenCappedCrowdsale is Crowdsale {
  using SafeMath for uint256;

  uint256 public tokenCap;

  // Amount of token sold
  uint256 public soldTokens;

  constructor(uint256 _tokenCap) public {
    require(_tokenCap > 0, "Token Cap should be greater than zero");
    tokenCap = _tokenCap;
  }

  function tokenCapReached() public view returns (bool) {
    return soldTokens >= tokenCap;
  }

  function _preValidatePurchase(
    address _beneficiary,
    uint256 _weiAmount
  )
    internal
  {
    require(
      soldTokens.add(_getTokenAmount(_weiAmount)) <= tokenCap,
      "Can't sell more than token cap tokens"
    );
    super._preValidatePurchase(_beneficiary, _weiAmount);
  }

  function _updatePurchasingState(
    address _beneficiary,
    uint256 _weiAmount
  )
    internal
  {
    super._updatePurchasingState(_beneficiary, _weiAmount);
    soldTokens = soldTokens.add(_getTokenAmount(_weiAmount));
  }
}
