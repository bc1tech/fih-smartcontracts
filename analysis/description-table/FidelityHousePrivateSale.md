## Sūrya's Description Report

### Files Description Table


|  File Name  |  SHA-1 Hash  |
|-------------|--------------|
| dist/FidelityHousePrivateSale.dist.sol | c402eb3557e59020e3728651d31cde16c3eaa891 |


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
| **Ownable** | Implementation |  |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
| └ | renounceOwnership | Public ❗️ | 🛑  | onlyOwner |
| └ | transferOwnership | Public ❗️ | 🛑  | onlyOwner |
| └ | _transferOwnership | Internal 🔒 | 🛑  | |
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
| **DetailedERC20** | Implementation | ERC20 |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
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
| **MintableToken** | Implementation | StandardToken, Ownable |||
| └ | mint | Public ❗️ | 🛑  | hasMintPermission canMint |
| └ | finishMinting | Public ❗️ | 🛑  | onlyOwner canMint |
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
| **TokenRecover** | Implementation | Ownable |||
| └ | recoverERC20 | Public ❗️ | 🛑  | onlyOwner |
||||||
| **FidelityHouseToken** | Implementation | DetailedERC20, RBACMintableToken, BurnableToken, ERC1363BasicToken, TokenRecover |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | DetailedERC20 |
| └ | lockedBalanceOf | Public ❗️ |   | |
| └ | mintAndLock | Public ❗️ | 🛑  | hasMintPermission canMint |
| └ | transfer | Public ❗️ | 🛑  | canTransfer |
| └ | transferFrom | Public ❗️ | 🛑  | canTransfer |
||||||
| **FidelityHousePrivateSale** | Implementation | TokenRecover |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
| └ | multiSend | External ❗️ | 🛑  | onlyOwner |


### Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
