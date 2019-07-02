const fs = require('fs');
const { web3, deploy, getContract, promisify } = require('../lib/web3Helper');
const readFile = promisify(fs.readFile);

const Dapp = require('../lib/dapp.js');

const BountyArtifact = require('../../build/contracts/FidelityHouseBounty.json');
const TokenArtifact = require('../../build/contracts/FidelityHouseToken.json');

class BountyProgram {
  constructor (command) {
    this.dapp = new Dapp(command);
  }

  async init () {
    await this.dapp.init();

    if (this.dapp.eth.netId === 1 || this.dapp.eth.netId === 4) {
      const BountyContract = getContract(BountyArtifact, this.dapp.eth.netId);
      this.instance = BountyContract.at(this.dapp.eth.contractAddress);

      global.logger.info(`Set instance to ${this.instance.address}`);
    } else { // development
      const ERC20Contract = getContract(TokenArtifact, this.dapp.eth.netId);
      const oneMonthFromNow = Math.round(new Date().setMonth(new Date().getMonth() + 1) / 1000);
      const token = await deploy(ERC20Contract, [oneMonthFromNow], this.dapp.trxParams());
      const tokenInstance = ERC20Contract.at(token.address);
      global.logger.info(`Set token to ${tokenInstance.address}`);

      const BountyContract = getContract(BountyArtifact, this.dapp.eth.netId);
      const bounty = await deploy(BountyContract, [token.address], this.dapp.trxParams());
      this.instance = BountyContract.at(bounty.address);
      global.logger.info(`Set instance to ${this.instance.address}`);

      await tokenInstance.addMinter(this.instance.address, this.dapp.trxParams());
      global.logger.info(`Added minter to token ${tokenInstance.address}`);
    }
  }

  async start () {
    await this.init();

    global.logger.info(`Starting process using from address ${this.dapp.eth.from}`);

    let count = 0;
    this.dapp.gasUsed = 0;

    const users = JSON.parse(await readFile(this.dapp.input));

    let addresses = [];
    let tokens = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      const alreadySent = (await this.instance.sentTokens(user.address)).valueOf();

      if (parseFloat(alreadySent) === 0) {
        addresses.push(user.address);
        tokens.push(web3.toWei(new web3.BigNumber(user.token), 'ether')); // use from toWei because of decimals

        if (addresses.length === this.dapp.bulk) {
          this.multiSend(addresses, tokens)
            .then((data) => {
              if (this.dapp.dryrun) {
                global.logger.info(data);
              } else {
                global.logger.info(
                  `multiSend to: ${data.to.toString()}` +
                  `\ttxhash: ${data.tx.tx}` +
                  `\tgasUsed: ${data.tx.receipt.gasUsed}` +
                  `\tstatus: ${data.tx.receipt.status}`
                );
              }
            })
            .catch(err => {
              global.logger.info(`multiSend at ${addresses} error => ${err}`);
            });

          // pause every "limit" transactions
          ++count;
          if (this.dapp.limit && (count % this.dapp.limit === 0)) {
            // console.log('Press any key to continue.');
            // await new Promise((res) => process.stdin.once('data', res))
            global.logger.info(`Waiting ${this.dapp.timeout} seconds`);
            await new Promise(resolve => setTimeout(resolve, this.dapp.timeout * 1000));
          }

          addresses = [];
          tokens = [];
        }
      }
    }
  }

  async multiSend (addresses, tokens) {
    if (this.dapp.dryrun) {
      global.logger.info(`Start dryrun multiSend for ${addresses.join(',')}`);
      const gasEstimation = await this.instance.multiSend.estimateGas(addresses, tokens, this.dapp.trxParams());
      this.dapp.gasUsed = this.dapp.gasUsed + gasEstimation;
      return {
        gasEstimation,
        totalGasUsed: this.dapp.gasUsed,
      };
    } else {
      global.logger.info(`Nonce ${this.dapp.eth.nonce + 1}. Start multiSend for ${addresses.join(',')}`);
      const tx = await this.instance.multiSend(addresses, tokens, this.dapp.trxParams());

      return {
        to: addresses,
        tx,
      };
    }
  }
}

module.exports = BountyProgram;
