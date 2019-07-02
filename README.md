# FidelityHouse ICO

[![Build Status](https://travis-ci.org/bc1tech/fih-smartcontracts.svg?branch=master)](https://travis-ci.org/bc1tech/fih-smartcontracts) 
[![Coverage Status](https://coveralls.io/repos/github/bc1tech/fih-smartcontracts/badge.svg?branch=master)](https://coveralls.io/github/bc1tech/fih-smartcontracts?branch=master)


Smart Contracts for the FIH token issued by FidelityHouse International SA.

Code created using [Open Zeppelin (openzeppelin-solidity)](https://github.com/OpenZeppelin/openzeppelin-solidity) and [Truffle Framework](https://github.com/trufflesuite/truffle).

Latest ICO block = 7560016;

## Installation

Install truffle.

```bash
npm install -g truffle      // Version 4.1.15+ required.
```

## Install dependencies

```bash
npm install
```

## Linter

Use Ethlint

```bash
npm run lint:sol
```

Use ESLint

```bash
npm run lint:js
```

#### Note

IMPORTANT: Before commit run the lint and fix command:

```bash
npm run lint:fix
```

## Compile and test the contracts
 
Open the Truffle console

```bash
truffle develop
```

Compile 

```bash
compile 
```

Test

```bash
test
```

## Optional

Install the [truffle-flattener](https://github.com/alcuadrado/truffle-flattener)

```bash
npm install -g truffle-flattener
```

Usage 

```bash
truffle-flattener contracts/FidelityHouseToken.sol > dist/FidelityHouseToken.dist.sol
```

## Links

Solidity [Doc](https://solidity.readthedocs.io) [Github](https://solidity.readthedocs.io)

OpenZeppelin [Doc](http://zeppelin-solidity.readthedocs.io) [Github](https://github.com/OpenZeppelin)

Truffle [Doc](http://truffleframework.com/docs) [Github](https://github.com/trufflesuite/truffle)

Web3.js [Doc 0.20.6](https://github.com/ethereum/wiki/wiki/JavaScript-API) [Doc 1.0](http://web3js.readthedocs.io/en/1.0) [Github](https://github.com/ethereum/web3.js)
