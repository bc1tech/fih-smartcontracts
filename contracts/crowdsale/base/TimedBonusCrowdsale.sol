pragma solidity ^0.4.25;

// solium-disable-next-line max-len
import "openzeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "./DefaultICO.sol";
import "../../token/FidelityHouseToken.sol";

/**
 * @title TimedBonusCrowdsale
 * @dev Extension of MintedCrowdsale and DefaultICO contract whose bonus decrease in time.
 */
contract TimedBonusCrowdsale is MintedCrowdsale, DefaultICO {

  uint256[] public bonusDates;
  uint256[] public bonusRates;

  function setBonusRates(
    uint256[] _bonusDates,
    uint256[] _bonusRates
  )
    external
    onlyOwner
  {
    require(
      !started(),
      "Bonus rates can be set only before the campaign start"
    );
    require(
      _bonusDates.length == 4,
      "Dates array must have 4 entries."
    );
    require(
      _bonusRates.length == 4,
      "Rates array must have 4 entries."
    );
    require(
      _bonusDates[0] < _bonusDates[1] && _bonusDates[1] < _bonusDates[2] && _bonusDates[2] < _bonusDates[3], // solium-disable-line max-len
      "Dates must be consecutive"
    );

    bonusDates = _bonusDates;
    bonusRates = _bonusRates;
  }

  function getCurrentBonus() public view returns (uint256) {
    uint256 bonusPercent = 0;

    if (bonusDates.length > 0) {
      if (block.timestamp < bonusDates[0]) { // solium-disable-line security/no-block-members
        bonusPercent = bonusRates[0];
      } else if (block.timestamp < bonusDates[1]) { // solium-disable-line security/no-block-members
        bonusPercent = bonusRates[1];
      } else if (block.timestamp < bonusDates[2]) { // solium-disable-line security/no-block-members
        bonusPercent = bonusRates[2];
      } else if (block.timestamp < bonusDates[3]) { // solium-disable-line security/no-block-members
        bonusPercent = bonusRates[3];
      }
    }

    return bonusPercent;
  }

  /**
   * @dev Override to extend the way in which ether is converted to tokens.
   * @param _weiAmount Value in wei to be converted into tokens
   * @return Number of tokens that can be purchased with the specified _weiAmount
   */
  function _getTokenAmount(
    uint256 _weiAmount
  )
    internal
    view
    returns (uint256)
  {
    uint256 bonusAmount = 0;
    uint256 tokenAmount = super._getTokenAmount(_weiAmount);

    uint256 bonusPercent = getCurrentBonus();

    if (bonusPercent > 0) {
      bonusAmount = tokenAmount.mul(bonusPercent).div(100);
    }

    return tokenAmount.add(bonusAmount);
  }
}
