pragma solidity ^0.4.24;

// solium-disable-next-line max-len
import "openzeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "./base/MintAndLockCrowdsale.sol";
import "./base/DefaultCrowdsale.sol";

// solium-disable-next-line max-len
contract FidelityHousePresale is DefaultCrowdsale, CappedCrowdsale, MintAndLockCrowdsale {

  constructor(
    uint256 _openingTime,
    uint256 _closingTime,
    uint256 _rate,
    uint256 _bonusRate,
    address _wallet,
    uint256 _cap,
    uint256 _minimumContribution,
    address _token,
    address _contributions
  )
    DefaultCrowdsale(
      _openingTime,
      _closingTime,
      _rate,
      _wallet,
      _minimumContribution,
      _token,
      _contributions
    )
    CappedCrowdsale(_cap)
    MintAndLockCrowdsale(_bonusRate)
    public
  {}

  // false if the ico is not started, false if the ico is started and running, true if the ico is completed
  function ended() public view returns(bool) {
    return hasClosed() || capReached();
  }

  /**
 * @dev Extend parent behavior to add contributions log
 * @dev Executed when a purchase has been validated and is ready to be executed. Not necessarily emits/sends tokens.
 * @param _beneficiary Address receiving the tokens
 * @param _tokenAmount Number of tokens to be purchased
 */
  function _processPurchase(
    address _beneficiary,
    uint256 _tokenAmount
  )
    internal
  {
    super._processPurchase(_beneficiary, _tokenAmount);
    if (bonusRate > 0) {
      contributions.addTokenBalance(_beneficiary, _getBonusAmount(_tokenAmount));
    }
  }
}
