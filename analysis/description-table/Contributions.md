## Sūrya's Description Report

### Files Description Table


|  File Name  |  SHA-1 Hash  |
|-------------|--------------|
| dist/Contributions.dist.sol | 31bbe4714b66c59b0cc57c709dafe32909c90b2e |


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


### Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
