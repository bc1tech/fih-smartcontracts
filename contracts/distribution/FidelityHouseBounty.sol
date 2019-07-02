pragma solidity ^0.4.24;

import "../token/FidelityHouseToken.sol";

contract FidelityHouseBounty is TokenRecover {
  using SafeMath for uint256;

  mapping (address => uint256) public sentTokens;

  FidelityHouseToken public token;

  constructor(address _token) public {
    require(
      _token != address(0),
      "Token shouldn't be the zero address."
    );

    token = FidelityHouseToken(_token);
  }

  function multiSend(
    address[] _addresses,
    uint256[] _amounts
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
      _addresses.length == _amounts.length,
      "Addresses and amounts arrays should have the same length."
    );

    uint len = _addresses.length;
    for (uint i = 0; i < len; i++) {
      address _beneficiary = _addresses[i];
      uint256 _tokenAmount = _amounts[i];

      if (sentTokens[_beneficiary] == 0) {
        sentTokens[_beneficiary] = _tokenAmount;
        token.mint(_beneficiary, _tokenAmount);
      }
    }
  }
}
