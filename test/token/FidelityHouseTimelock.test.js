const { latestTime } = require('../helpers/latestTime');
const { duration } = require('../helpers/increaseTime');
const { advanceBlock } = require('../helpers/advanceToBlock');

const { shouldBehaveLikeTokenTimelock } = require('./ERC20/TokenTimelock.behaviour');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const FidelityHouseToken = artifacts.require('FidelityHouseToken');
const FidelityHouseTimelock = artifacts.require('FidelityHouseTimelock');

contract('FidelityHouseTimelock', function ([owner, beneficiary]) {
  const amount = new BigNumber(100);

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.lockedUntil = (await latestTime()) + duration.weeks(1);
    this.token = await FidelityHouseToken.new(this.lockedUntil, { from: owner });

    this.releaseTime = (await latestTime()) + duration.years(1);
    this.timelock = await FidelityHouseTimelock.new(this.token.address, beneficiary, this.releaseTime);

    await this.token.addMinter(owner, { from: owner });
    await this.token.mint(this.timelock.address, amount, { from: owner });
    await this.token.finishMinting({ from: owner });
  });

  context('like a TokenTimelock', function () {
    shouldBehaveLikeTokenTimelock([owner, beneficiary]);
  });
});
