pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/RBACMintableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "erc-payable-token/contracts/token/ERC1363/ERC1363BasicToken.sol";
import "eth-token-recover/contracts/TokenRecover.sol";

// solium-disable-next-line max-len
contract FidelityHouseToken is DetailedERC20, RBACMintableToken, BurnableToken, ERC1363BasicToken, TokenRecover {

  uint256 public lockedUntil;
  mapping(address => uint256) internal lockedBalances;

  modifier canTransfer(address _from, uint256 _value) {
    require(
      mintingFinished,
      "Minting should be finished before transfer."
    );
    require(
      _value <= balances[_from].sub(lockedBalanceOf(_from)),
      "Can't transfer more than unlocked tokens"
    );
    _;
  }

  constructor(uint256 _lockedUntil)
    DetailedERC20("FidelityHouse Token", "FIH", 18)
    public
  {
    lockedUntil = _lockedUntil;
  }

  /**
   * @dev Gets the locked balance of the specified address.
   * @param _owner The address to query the balance of.
   * @return An uint256 representing the locked amount owned by the passed address.
   */
  function lockedBalanceOf(address _owner) public view returns (uint256) {
    // solium-disable-next-line security/no-block-members
    return block.timestamp <= lockedUntil ? lockedBalances[_owner] : 0;
  }

  /**
   * @dev Function to mint and lock tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mintAndLock(
    address _to,
    uint256 _amount
  )
    public
    hasMintPermission
    canMint
    returns (bool)
  {
    lockedBalances[_to] = lockedBalances[_to].add(_amount);
    return super.mint(_to, _amount);
  }

  function transfer(
    address _to,
    uint256 _value
  )
    public
    canTransfer(msg.sender, _value)
    returns (bool)
  {
    return super.transfer(_to, _value);
  }

  function transferFrom(
    address _from,
    address _to,
    uint256 _value
  )
    public
    canTransfer(_from, _value)
    returns (bool)
  {
    return super.transferFrom(_from, _to, _value);
  }
}
