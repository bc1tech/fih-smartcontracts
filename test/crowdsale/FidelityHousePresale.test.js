const { advanceBlock } = require('../helpers/advanceToBlock');
const { duration, increaseTimeTo } = require('../helpers/increaseTime');
const { latestTime } = require('../helpers/latestTime');
const { ether } = require('../helpers/ether');
const { assertRevert } = require('../helpers/assertRevert');

const { shouldBehaveDefaultCrowdsale } = require('./base/DefaultCrowdsale.behaviour');
const { shouldBehaveLikeCappedCrowdsale } = require('./base/CappedCrowdsale.behaviour');
const { shouldBehaveLikeMintAndLockCrowdsale } = require('./base/MintAndLockCrowdsale.behaviour');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const FidelityHousePresale = artifacts.require('FidelityHousePresale');
const FidelityHouseToken = artifacts.require('FidelityHouseToken');
const Contributions = artifacts.require('Contributions');

const ROLE_MINTER = 'minter';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('FidelityHousePresale', function ([owner, investor, wallet, purchaser, thirdParty]) {
  const cap = ether(1);
  const minimumContribution = ether(0.2);
  const tierLimit = ether(0.4);

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  const shouldBehaveLikeItself = function (rate, bonusRate, totalRate) {
    beforeEach(async function () {
      this.openingTime = (await latestTime()) + duration.weeks(1);
      this.closingTime = this.openingTime + duration.weeks(1);
      this.afterClosingTime = this.closingTime + duration.seconds(1);
      this.lockedUntil = this.afterClosingTime + duration.weeks(1);

      this.token = await FidelityHouseToken.new(this.lockedUntil);
      this.contributions = await Contributions.new(tierLimit);
      this.crowdsale = await FidelityHousePresale.new(
        this.openingTime,
        this.closingTime,
        rate,
        bonusRate,
        wallet,
        cap,
        minimumContribution,
        this.token.address,
        this.contributions.address
      );

      await this.token.addMinter(this.crowdsale.address);
      await this.contributions.addMinter(this.crowdsale.address);

      // setting tier 2 to be able sending big amounts
      await this.contributions.addToWhitelist(investor, 2);
      await this.contributions.addToWhitelist(purchaser, 2);
    });

    context('like a DefaultCrowdsale', function () {
      shouldBehaveDefaultCrowdsale(
        [
          owner,
          investor,
          wallet,
          purchaser,
          thirdParty,
        ],
        totalRate,
        minimumContribution,
        minimumContribution
      );
    });

    context('like a MintAndLockCrowdsale', function () {
      const value = ether(0.2);

      beforeEach(async function () {
        await increaseTimeTo(this.openingTime);
      });
      shouldBehaveLikeMintAndLockCrowdsale([owner, investor, wallet, purchaser], rate, bonusRate, value);
    });

    context('like a CappedCrowdsale', function () {
      beforeEach(async function () {
        await increaseTimeTo(this.openingTime);
      });
      shouldBehaveLikeCappedCrowdsale([investor, purchaser]);
    });

    context('like a FidelityHousePresale', function () {
      describe('creating a valid crowdsale', function () {
        it('should be token minter', async function () {
          const isMinter = await this.token.hasRole(this.crowdsale.address, ROLE_MINTER);
          isMinter.should.equal(true);
        });

        it('cap should be right set by token cap', async function () {
          const expectedCap = await this.crowdsale.cap();
          cap.should.be.bignumber.equal(expectedCap);
        });

        it('should fail with zero rate', async function () {
          await assertRevert(
            FidelityHousePresale.new(
              this.openingTime,
              this.closingTime,
              0,
              bonusRate,
              wallet,
              cap,
              minimumContribution,
              this.token.address,
              this.contributions.address
            )
          );
        });

        it('should fail if wallet is the zero address', async function () {
          await assertRevert(
            FidelityHousePresale.new(
              this.openingTime,
              this.closingTime,
              rate,
              bonusRate,
              ZERO_ADDRESS,
              cap,
              minimumContribution,
              this.token.address,
              this.contributions.address
            )
          );
        });

        it('should fail if token is the zero address', async function () {
          await assertRevert(
            FidelityHousePresale.new(
              this.openingTime,
              this.closingTime,
              rate,
              bonusRate,
              wallet,
              cap,
              minimumContribution,
              ZERO_ADDRESS,
              this.contributions.address
            )
          );
        });

        it('should fail if opening time is in the past', async function () {
          await assertRevert(
            FidelityHousePresale.new(
              (await latestTime()) - duration.seconds(1),
              this.closingTime,
              rate,
              bonusRate,
              wallet,
              cap,
              minimumContribution,
              this.token.address,
              this.contributions.address
            )
          );
        });

        it('should fail if opening time is after closing time in the past', async function () {
          await assertRevert(
            FidelityHousePresale.new(
              this.closingTime,
              this.openingTime,
              rate,
              bonusRate,
              wallet,
              cap,
              minimumContribution,
              this.token.address,
              this.contributions.address
            )
          );
        });

        it('should fail if contributions is the zero address', async function () {
          await assertRevert(
            FidelityHousePresale.new(
              this.openingTime,
              this.closingTime,
              rate,
              bonusRate,
              wallet,
              cap,
              minimumContribution,
              this.token.address,
              ZERO_ADDRESS
            )
          );
        });

        it('should fail with zero cap', async function () {
          await assertRevert(
            FidelityHousePresale.new(
              this.openingTime,
              this.closingTime,
              rate,
              bonusRate,
              wallet,
              0,
              minimumContribution,
              this.token.address,
              this.contributions.address
            )
          );
        });
      });

      context('should have expected utility methods and values', function () {
        describe('before start', function () {
          it('started should be false', async function () {
            const toTest = await this.crowdsale.started();
            assert.equal(toTest, false);
          });

          it('ended should be false', async function () {
            const toTest = await this.crowdsale.ended();
            assert.equal(toTest, false);
          });

          it('capReached should be false', async function () {
            const toTest = await this.crowdsale.capReached();
            assert.equal(toTest, false);
          });
        });

        describe('after start and before end', function () {
          beforeEach(async function () {
            await increaseTimeTo(this.openingTime);
          });

          it('started should be true', async function () {
            const toTest = await this.crowdsale.started();
            assert.equal(toTest, true);
          });

          describe('if cap not reached', function () {
            it('ended should be false', async function () {
              const toTest = await this.crowdsale.ended();
              assert.equal(toTest, false);
            });

            it('capReached should be false', async function () {
              const toTest = await this.crowdsale.capReached();
              assert.equal(toTest, false);
            });
          });

          describe('if cap reached', function () {
            beforeEach(async function () {
              await this.crowdsale.sendTransaction({ value: cap, from: investor });
            });

            it('ended should be true', async function () {
              const toTest = await this.crowdsale.ended();
              assert.equal(toTest, true);
            });

            it('capReached should be true', async function () {
              const toTest = await this.crowdsale.capReached();
              assert.equal(toTest, true);
            });
          });
        });

        describe('after end', function () {
          beforeEach(async function () {
            await increaseTimeTo(this.afterClosingTime);
          });

          it('started should be true', async function () {
            const toTest = await this.crowdsale.started();
            assert.equal(toTest, true);
          });

          it('ended should be true', async function () {
            const toTest = await this.crowdsale.ended();
            assert.equal(toTest, true);
          });
        });
      });
    });
  };

  context('if there is not a bonus rate', function () {
    const rate = new BigNumber(1000);
    const bonusRate = new BigNumber(0);
    const totalRate = rate;

    shouldBehaveLikeItself(rate, bonusRate, totalRate);
  });

  context('if there is a bonus rate', function () {
    const rate = new BigNumber(1000);
    const bonusRate = new BigNumber(27);
    const totalRate = rate.add(rate.mul(bonusRate).div(100));

    shouldBehaveLikeItself(rate, bonusRate, totalRate);
  });
});
