pragma solidity ^0.4.25;

// solium-disable-next-line max-len
import "openzeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "eth-token-recover/contracts/TokenRecover.sol";

import "../utils/Contributions.sol";

contract DefaultICO is TimedCrowdsale, TokenRecover {

  Contributions public contributions;

  uint256 public minimumContribution;
  uint256 public tierZero;

  constructor(
    uint256 _openingTime,
    uint256 _closingTime,
    uint256 _rate,
    address _wallet,
    uint256 _minimumContribution,
    address _token,
    address _contributions,
    uint256 _tierZero
  )
    Crowdsale(_rate, _wallet, ERC20(_token))
    TimedCrowdsale(_openingTime, _closingTime)
    public
  {
    require(
      _contributions != address(0),
      "Contributions address can't be the zero address."
    );
    contributions = Contributions(_contributions);
    minimumContribution = _minimumContribution;
    tierZero = _tierZero;
  }

  // Utility methods

  // false if the ico is not started, true if the ico is started and running, true if the ico is completed
  function started() public view returns(bool) {
    // solium-disable-next-line security/no-block-members
    return block.timestamp >= openingTime;
  }

  function setTierZero(uint256 _newTierZero) external onlyOwner {
    tierZero = _newTierZero;
  }

  /**
   * @dev Extend parent behavior requiring purchase to respect the minimumContribution.
   * @param _beneficiary Token purchaser
   * @param _weiAmount Amount of wei contributed
   */
  function _preValidatePurchase(
    address _beneficiary,
    uint256 _weiAmount
  )
    internal
  {
    require(
      _weiAmount >= minimumContribution,
      "Can't send less than the minimum contribution"
    );

    // solium-disable-next-line max-len
    if (contributions.ethContributions(_beneficiary).add(_weiAmount) > tierZero) {
      require(
        contributions.isAllowedPurchase(_beneficiary, _weiAmount),
        "Beneficiary is not allowed to purchase this amount"
      );
    }

    super._preValidatePurchase(_beneficiary, _weiAmount);
  }


  /**
   * @dev Extend parent behavior to update user contributions
   * @param _beneficiary Token purchaser
   * @param _weiAmount Amount of wei contributed
   */
  function _updatePurchasingState(
    address _beneficiary,
    uint256 _weiAmount
  )
    internal
  {
    super._updatePurchasingState(_beneficiary, _weiAmount);
    contributions.addEthContribution(_beneficiary, _weiAmount);
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
    contributions.addTokenBalance(_beneficiary, _tokenAmount);
  }
}
