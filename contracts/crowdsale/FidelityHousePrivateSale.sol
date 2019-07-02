pragma solidity ^0.4.24;

import "./utils/Contributions.sol";
import "../token/FidelityHouseToken.sol";

contract FidelityHousePrivateSale is TokenRecover {
  using SafeMath for uint256;

  mapping (address => uint256) public sentTokens;

  FidelityHouseToken public token;
  Contributions public contributions;

  constructor(address _token, address _contributions) public {
    require(
      _token != address(0),
      "Token shouldn't be the zero address."
    );
    require(
      _contributions != address(0),
      "Contributions address can't be the zero address."
    );

    token = FidelityHouseToken(_token);
    contributions = Contributions(_contributions);
  }

  function multiSend(
    address[] _addresses,
    uint256[] _amounts,
    uint256[] _bonuses
  )
    external
    onlyOwner
  {
    require(
      _addresses.length > 0,
      "Addresses array shouldn't be empty."
    );
    require(
      _amounts.length > 0,
      "Amounts array shouldn't be empty."
    );
    require(
      _bonuses.length > 0,
      "Bonuses array shouldn't be empty."
    );
    require(
      _addresses.length == _amounts.length && _addresses.length == _bonuses.length,
      "Arrays should have the same length."
    );

    uint len = _addresses.length;
    for (uint i = 0; i < len; i++) {
      address _beneficiary = _addresses[i];
      uint256 _tokenAmount = _amounts[i];
      uint256 _bonusAmount = _bonuses[i];

      if (sentTokens[_beneficiary] == 0) {
        uint256 totalTokens = _tokenAmount.add(_bonusAmount);
        sentTokens[_beneficiary] = totalTokens;
        token.mintAndLock(_beneficiary, _tokenAmount);
        token.mint(_beneficiary, _bonusAmount);
        contributions.addTokenBalance(_beneficiary, totalTokens);
      }
    }
  }
}
