## Commands to send tokens and do stuffs with smart contracts

### Usage

```bash
node commands 
```

You will be prompted with

```bash
enter command (tab for autocomplete):
```

Available tasks are private-sale, vendor-referral, bounty-program.

#### private-sale

It distributes tokens bought during private sale. They are locked for 9 months.

#### vendor-referral

It distributes tokens for referral fees and advisors. They are locked for 9 months.

#### bounty-program

It distributes tokens for bounty program. They are unlocked.

### Examples

#### Development

```bash
node commands --input="./commands/sample-data/private-sale-datas.json"
```

#### Rinkeby Test Network

```bash
node commands --endpoint=https://rinkeby.infura.io --net-id=4 --from=0x1df435fe67f6e518a72a08e06b23ec1fd0805245 --contract=0x211f7C70e9F8f9C0194d3E8B1797372D916916f5 --nonce=1
```

### Options

```bash
--endpoint, -e      ethereum rpc endpoint.                              [string]    [default: "http://127.0.0.1:8545"]
--input, -i         path of json file containing the list of datas      [string]    [default: "./input/private-sale-datas.json"]
--out, -o           directory for json files where to store results     [string]    [default: "./scripts/output"]
--net-id, -n        network id                                          [number]    [default: 5777]
--from, -f          sending address                                     [string]
--contract, -c      contract address                                    [string]
--gas-limit         provided gas limit                                  [number]    [default: 6721975]
--gas-price         provided gas price in gwei                          [number]    [default: 5]
--nonce             progressive nonce id                                [number]
--log-level         log level used for logging                          [string]    [default: "debug"]
--pause-every       pause every the specified number of transactions    [number]    [default: 1]
--timeout           number of seconds to wait                           [number]    [default: 10]
--bulk              number of addresses to use                          [number]    [default: 1]
--dryrun            simulate sends                                      [boolean]
--help              show help                                           [boolean]
```
