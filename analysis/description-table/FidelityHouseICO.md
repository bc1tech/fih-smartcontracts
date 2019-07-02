## Sūrya's Description Report

### Files Description Table


|  File Name  |  SHA-1 Hash  |
|-------------|--------------|
| dist/FidelityHouseICO.dist.sol | 149d72780f6087fa423c442ab278096d850c3965 |


### Contracts Description Table


|  Contract  |         Type        |       Bases      |                  |                 |
|:----------:|:-------------------:|:----------------:|:----------------:|:---------------:|
|     └      |  **Function Name**  |  **Visibility**  |  **Mutability**  |  **Modifiers**  |
||||||
| **SafeMath** | Library |  |||
| └ | mul | Internal 🔒 |   | |
| └ | div | Internal 🔒 |   | |
| └ | sub | Internal 🔒 |   | |
| └ | add | Internal 🔒 |   | |
||||||
| **ERC20Basic** | Implementation |  |||
| └ | totalSupply | Public ❗️ |   | |
| └ | balanceOf | Public ❗️ |   | |
| └ | transfer | Public ❗️ | 🛑  | |
||||||
| **ERC20** | Implementation | ERC20Basic |||
| └ | allowance | Public ❗️ |   | |
| └ | transferFrom | Public ❗️ | 🛑  | |
| └ | approve | Public ❗️ | 🛑  | |
||||||
| **SafeERC20** | Library |  |||
| └ | safeTransfer | Internal 🔒 | 🛑  | |
| └ | safeTransferFrom | Internal 🔒 | 🛑  | |
| └ | safeApprove | Internal 🔒 | 🛑  | |
||||||
| **Crowdsale** | Implementation |  |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
| └ | \<Fallback\> | External ❗️ |  💵 | |
| └ | buyTokens | Public ❗️ |  💵 | |
| └ | _preValidatePurchase | Internal 🔒 | 🛑  | |
| └ | _postValidatePurchase | Internal 🔒 | 🛑  | |
| └ | _deliverTokens | Internal 🔒 | 🛑  | |
| └ | _processPurchase | Internal 🔒 | 🛑  | |
| └ | _updatePurchasingState | Internal 🔒 | 🛑  | |
| └ | _getTokenAmount | Internal 🔒 |   | |
| └ | _forwardFunds | Internal 🔒 | 🛑  | |
||||||
| **TokenCappedCrowdsale** | Implementation | Crowdsale |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
| └ | tokenCapReached | Public ❗️ |   | |
| └ | _preValidatePurchase | Internal 🔒 | 🛑  | |
| └ | _updatePurchasingState | Internal 🔒 | 🛑  | |
||||||
| **BasicToken** | Implementation | ERC20Basic |||
| └ | totalSupply | Public ❗️ |   | |
| └ | transfer | Public ❗️ | 🛑  | |
| └ | balanceOf | Public ❗️ |   | |
||||||
| **StandardToken** | Implementation | ERC20, BasicToken |||
| └ | transferFrom | Public ❗️ | 🛑  | |
| └ | approve | Public ❗️ | 🛑  | |
| └ | allowance | Public ❗️ |   | |
| └ | increaseApproval | Public ❗️ | 🛑  | |
| └ | decreaseApproval | Public ❗️ | 🛑  | |
||||||
| **Ownable** | Implementation |  |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
| └ | renounceOwnership | Public ❗️ | 🛑  | onlyOwner |
| └ | transferOwnership | Public ❗️ | 🛑  | onlyOwner |
| └ | _transferOwnership | Internal 🔒 | 🛑  | |
||||||
| **MintableToken** | Implementation | StandardToken, Ownable |||
| └ | mint | Public ❗️ | 🛑  | hasMintPermission canMint |
| └ | finishMinting | Public ❗️ | 🛑  | onlyOwner canMint |
||||||
| **MintedCrowdsale** | Implementation | Crowdsale |||
| └ | _deliverTokens | Internal 🔒 | 🛑  | |
||||||
| **TimedCrowdsale** | Implementation | Crowdsale |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
| └ | hasClosed | Public ❗️ |   | |
| └ | _preValidatePurchase | Internal 🔒 | 🛑  | onlyWhileOpen |
||||||
| **TokenRecover** | Implementation | Ownable |||
| └ | recoverERC20 | Public ❗️ | 🛑  | onlyOwner |
||||||
| **Roles** | Library |  |||
| └ | add | Internal 🔒 | 🛑  | |
| └ | remove | Internal 🔒 | 🛑  | |
| └ | check | Internal 🔒 |   | |
| └ | has | Internal 🔒 |   | |
||||||
| **RBAC** | Implementation |  |||
| └ | checkRole | Public ❗️ |   | |
| └ | hasRole | Public ❗️ |   | |
| └ | addRole | Internal 🔒 | 🛑  | |
| └ | removeRole | Internal 🔒 | 🛑  | |
||||||
| **Contributions** | Implementation | RBAC, Ownable |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
| └ | addMinter | External ❗️ | 🛑  | onlyOwner |
| └ | removeMinter | External ❗️ | 🛑  | onlyOwner |
| └ | addOperator | External ❗️ | 🛑  | onlyOwner |
| └ | removeOperator | External ❗️ | 🛑  | onlyOwner |
| └ | addTokenBalance | External ❗️ | 🛑  | onlyMinter |
| └ | addEthContribution | External ❗️ | 🛑  | onlyMinter |
| └ | setTierLimit | External ❗️ | 🛑  | onlyOperator |
| └ | addToWhitelist | External ❗️ | 🛑  | onlyOperator |
| └ | removeFromWhitelist | External ❗️ | 🛑  | onlyOperator |
| └ | whitelistTier | External ❗️ |   | |
| └ | getWhitelistedAddresses | External ❗️ |   | |
| └ | isAllowedPurchase | External ❗️ |   | |
| └ | getTokenAddressesLength | External ❗️ |   | |
| └ | getEthAddressesLength | External ❗️ |   | |
||||||
| **DefaultICO** | Implementation | TimedCrowdsale, TokenRecover |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | Crowdsale TimedCrowdsale |
| └ | started | Public ❗️ |   | |
| └ | setTierZero | External ❗️ | 🛑  | onlyOwner |
| └ | _preValidatePurchase | Internal 🔒 | 🛑  | |
| └ | _updatePurchasingState | Internal 🔒 | 🛑  | |
| └ | _processPurchase | Internal 🔒 | 🛑  | |
||||||
| **DetailedERC20** | Implementation | ERC20 |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
||||||
| **RBACMintableToken** | Implementation | MintableToken, RBAC |||
| └ | addMinter | Public ❗️ | 🛑  | onlyOwner |
| └ | removeMinter | Public ❗️ | 🛑  | onlyOwner |
||||||
| **BurnableToken** | Implementation | BasicToken |||
| └ | burn | Public ❗️ | 🛑  | |
| └ | _burn | Internal 🔒 | 🛑  | |
||||||
| **AddressUtils** | Library |  |||
| └ | isContract | Internal 🔒 |   | |
||||||
| **ERC165** | Interface |  |||
| └ | supportsInterface | External ❗️ |   | |
||||||
| **SupportsInterfaceWithLookup** | Implementation | ERC165 |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
| └ | supportsInterface | External ❗️ |   | |
| └ | _registerInterface | Internal 🔒 | 🛑  | |
||||||
| **ERC1363** | Implementation | ERC20, ERC165 |||
| └ | transferAndCall | Public ❗️ | 🛑  | |
| └ | transferAndCall | Public ❗️ | 🛑  | |
| └ | transferFromAndCall | Public ❗️ | 🛑  | |
| └ | transferFromAndCall | Public ❗️ | 🛑  | |
| └ | approveAndCall | Public ❗️ | 🛑  | |
| └ | approveAndCall | Public ❗️ | 🛑  | |
||||||
| **ERC1363Receiver** | Implementation |  |||
| └ | onTransferReceived | External ❗️ | 🛑  | |
||||||
| **ERC1363Spender** | Implementation |  |||
| └ | onApprovalReceived | External ❗️ | 🛑  | |
||||||
| **ERC1363BasicToken** | Implementation | SupportsInterfaceWithLookup, StandardToken, ERC1363 |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
| └ | transferAndCall | Public ❗️ | 🛑  | |
| └ | transferAndCall | Public ❗️ | 🛑  | |
| └ | transferFromAndCall | Public ❗️ | 🛑  | |
| └ | transferFromAndCall | Public ❗️ | 🛑  | |
| └ | approveAndCall | Public ❗️ | 🛑  | |
| └ | approveAndCall | Public ❗️ | 🛑  | |
| └ | checkAndCallTransfer | Internal 🔒 | 🛑  | |
| └ | checkAndCallApprove | Internal 🔒 | 🛑  | |
||||||
| **FidelityHouseToken** | Implementation | DetailedERC20, RBACMintableToken, BurnableToken, ERC1363BasicToken, TokenRecover |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | DetailedERC20 |
| └ | lockedBalanceOf | Public ❗️ |   | |
| └ | mintAndLock | Public ❗️ | 🛑  | hasMintPermission canMint |
| └ | transfer | Public ❗️ | 🛑  | canTransfer |
| └ | transferFrom | Public ❗️ | 🛑  | canTransfer |
||||||
| **TimedBonusCrowdsale** | Implementation | MintedCrowdsale, DefaultICO |||
| └ | setBonusRates | External ❗️ | 🛑  | onlyOwner |
| └ | getCurrentBonus | Public ❗️ |   | |
| └ | _getTokenAmount | Internal 🔒 |   | |
||||||
| **FidelityHouseICO** | Implementation | TokenCappedCrowdsale, TimedBonusCrowdsale |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | DefaultICO TokenCappedCrowdsale |
| └ | adjustTokenCap | External ❗️ | 🛑  | onlyOwner |
| └ | ended | Public ❗️ |   | |


### Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
