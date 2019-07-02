pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "../../token/FidelityHouseToken.sol";

/**
 * @title MintAndLockCrowdsale
 * @dev Extension of Crowdsale contract whose tokens are minted and locked in each purchase.
 */
contract MintAndLockCrowdsale is Crowdsale {

  uint256 public totalRate;
  uint256 public bonusRate;

  constructor(uint256 _bonusRate) public {
    bonusRate = _bonusRate;
    totalRate = rate.add(_getBonusAmount(rate));
  }

  /**
   * @dev low level token purchase ***DO NOT OVERRIDE***
   * @param _beneficiary Address performing the token purchase
   */
  function buyTokens(address _beneficiary) public payable {

    uint256 weiAmount = msg.value;
    _preValidatePurchase(_beneficiary, weiAmount);

    // calculate token amount to be created
    uint256 tokens = _getTokenAmount(weiAmount);
    uint256 bonus = _getBonusAmount(tokens);

    // update state
    weiRaised = weiRaised.add(weiAmount);

    _processPurchase(_beneficiary, tokens);
    emit TokenPurchase(
      msg.sender,
      _beneficiary,
      weiAmount,
      tokens.add(bonus)
    );

    _updatePurchasingState(_beneficiary, weiAmount);

    _forwardFunds();
    _postValidatePurchase(_beneficiary, weiAmount);
  }

  /**
   * @dev Override to extend the way in which bonus is calculated.
   * @param _tokenAmount Tokens being purchased
   * @return Number of tokens that should be earned as bonus
   */
  function _getBonusAmount(
    uint256 _tokenAmount
  )
    internal
    view
    returns (uint256)
  {
    return _tokenAmount.mul(bonusRate).div(100);
  }

  /**
   * @dev Overrides delivery by minting and locking tokens upon purchase.
   * @param _beneficiary Token purchaser
   * @param _tokenAmount Number of tokens to be minted
   */
  function _deliverTokens(
    address _beneficiary,
    uint256 _tokenAmount
  )
    internal
  {
    FidelityHouseToken(address(token)).mintAndLock(_beneficiary, _tokenAmount);
    if (bonusRate > 0) {
      FidelityHouseToken(address(token)).mint(_beneficiary, _getBonusAmount(_tokenAmount));
    }
  }
}
