const { advanceBlock } = require('../helpers/advanceToBlock');
const { duration, increaseTimeTo } = require('../helpers/increaseTime');
const { latestTime } = require('../helpers/latestTime');
const { ether } = require('../helpers/ether');
const { assertRevert } = require('../helpers/assertRevert');

const { shouldBehaveDefaultICO } = require('./base/DefaultICO.behaviour');
const { shouldBehaveLikeMintedCrowdsale } = require('./base/MintedCrowdsale.behaviour');
const { shouldBehaveLikeTokenCappedCrowdsale } = require('./base/TokenCappedCrowdsale.behaviour');
const { shouldBehaveLikeTimedBonusCrowdsale } = require('./base/TimedBonusCrowdsale.behaviour');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const FidelityHouseICO = artifacts.require('FidelityHouseICO');
const FidelityHouseToken = artifacts.require('FidelityHouseToken');
const Contributions = artifacts.require('Contributions');

const ROLE_MINTER = 'minter';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('FidelityHouseICO', function ([owner, investor, wallet, purchaser, thirdParty]) {
  const rate = new BigNumber(1000);
  const tokenCap = new BigNumber(6000).mul(Math.pow(10, 18));
  const minimumContribution = ether(0.2);
  const tierOneLimit = ether(0.5);
  const tierZeroLimit = ether(0.3);

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.openingTime = (await latestTime()) + duration.weeks(1);
    this.closingTime = this.openingTime + duration.weeks(5);
    this.afterClosingTime = this.closingTime + duration.seconds(1);
    this.lockedUntil = this.afterClosingTime + duration.weeks(5);

    this.token = await FidelityHouseToken.new(this.lockedUntil);
    this.contributions = await Contributions.new(tierOneLimit);
    this.crowdsale = await FidelityHouseICO.new(
      this.openingTime,
      this.closingTime,
      rate,
      wallet,
      tokenCap,
      minimumContribution,
      this.token.address,
      this.contributions.address,
      tierZeroLimit
    );

    await this.token.addMinter(this.crowdsale.address);
    await this.contributions.addMinter(this.crowdsale.address);
  });

  context('like a DefaultICO', function () {
    shouldBehaveDefaultICO(
      [
        owner,
        investor,
        wallet,
        purchaser,
        thirdParty,
      ],
      rate,
      minimumContribution,
    );
  });

  context('like a MintedCrowdsale', function () {
    beforeEach(async function () {
      await increaseTimeTo(this.openingTime);

      // setting tier 2 to be able sending big amounts
      await this.contributions.addToWhitelist(investor, 2);
      await this.contributions.addToWhitelist(purchaser, 2);
    });
    shouldBehaveLikeMintedCrowdsale([owner, investor, wallet, purchaser], rate, minimumContribution);
  });

  context('like a TokenCappedCrowdsale', function () {
    beforeEach(async function () {
      await increaseTimeTo(this.openingTime);

      // setting tier 2 to be able sending big amounts
      await this.contributions.addToWhitelist(investor, 2);
      await this.contributions.addToWhitelist(purchaser, 2);
    });
    shouldBehaveLikeTokenCappedCrowdsale([investor, purchaser, thirdParty]);
  });

  context('like a TimedBonusCrowdsale', function () {
    beforeEach(async function () {
      // setting tier 2 to be able sending big amounts
      await this.contributions.addToWhitelist(investor, 2);
      await this.contributions.addToWhitelist(purchaser, 2);
    });
    shouldBehaveLikeTimedBonusCrowdsale([owner, investor, purchaser, thirdParty], rate, minimumContribution);
  });

  context('like a FidelityHouseICO', function () {
    describe('creating a valid crowdsale', function () {
      it('should be token minter', async function () {
        const isMinter = await this.token.hasRole(this.crowdsale.address, ROLE_MINTER);
        isMinter.should.equal(true);
      });

      it('should fail with zero rate', async function () {
        await assertRevert(
          FidelityHouseICO.new(
            this.openingTime,
            this.closingTime,
            0,
            wallet,
            tokenCap,
            minimumContribution,
            this.token.address,
            this.contributions.address,
            tierZeroLimit
          )
        );
      });

      it('should fail if wallet is the zero address', async function () {
        await assertRevert(
          FidelityHouseICO.new(
            this.openingTime,
            this.closingTime,
            rate,
            ZERO_ADDRESS,
            tokenCap,
            minimumContribution,
            this.token.address,
            this.contributions.address,
            tierZeroLimit
          )
        );
      });

      it('should fail if token is the zero address', async function () {
        await assertRevert(
          FidelityHouseICO.new(
            this.openingTime,
            this.closingTime,
            rate,
            wallet,
            tokenCap,
            minimumContribution,
            ZERO_ADDRESS,
            this.contributions.address,
            tierZeroLimit
          )
        );
      });

      it('should fail if opening time is in the past', async function () {
        await assertRevert(
          FidelityHouseICO.new(
            (await latestTime()) - duration.seconds(1),
            this.closingTime,
            rate,
            wallet,
            tokenCap,
            minimumContribution,
            this.token.address,
            this.contributions.address,
            tierZeroLimit
          )
        );
      });

      it('should fail if opening time is after closing time in the past', async function () {
        await assertRevert(
          FidelityHouseICO.new(
            this.closingTime,
            this.openingTime,
            rate,
            wallet,
            tokenCap,
            minimumContribution,
            this.token.address,
            this.contributions.address,
            tierZeroLimit
          )
        );
      });

      it('should fail if contributions is the zero address', async function () {
        await assertRevert(
          FidelityHouseICO.new(
            this.openingTime,
            this.closingTime,
            rate,
            wallet,
            tokenCap,
            minimumContribution,
            this.token.address,
            ZERO_ADDRESS,
            tierZeroLimit
          )
        );
      });

      it('should fail with zero tokenCap', async function () {
        await assertRevert(
          FidelityHouseICO.new(
            this.openingTime,
            this.closingTime,
            rate,
            wallet,
            0,
            minimumContribution,
            this.token.address,
            this.contributions.address,
            tierZeroLimit
          )
        );
      });
    });

    context('should have expected utility methods and values', function () {
      beforeEach(async function () {
        // setting tier 2 to be able sending big amounts
        await this.contributions.addToWhitelist(investor, 2);
        await this.contributions.addToWhitelist(purchaser, 2);
      });

      it('should have token cap', async function () {
        (await this.crowdsale.tokenCap()).should.be.bignumber.equal(tokenCap);
      });

      it('should have tier zero', async function () {
        (await this.crowdsale.tierZero()).should.be.bignumber.equal(tierZeroLimit);
      });

      describe('before start', function () {
        it('started should be false', async function () {
          const toTest = await this.crowdsale.started();
          assert.equal(toTest, false);
        });

        it('ended should be false', async function () {
          const toTest = await this.crowdsale.ended();
          assert.equal(toTest, false);
        });

        it('tokenCapReached should be false', async function () {
          const toTest = await this.crowdsale.tokenCapReached();
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

          it('tokenCapReached should be false', async function () {
            const toTest = await this.crowdsale.tokenCapReached();
            assert.equal(toTest, false);
          });
        });

        describe('if tokenCap reached', function () {
          const cap = tokenCap.div(rate);

          beforeEach(async function () {
            await this.crowdsale.sendTransaction({ value: cap, from: investor });
          });

          it('ended should be true', async function () {
            const toTest = await this.crowdsale.ended();
            assert.equal(toTest, true);
          });

          it('tokenCapReached should be true', async function () {
            const toTest = await this.crowdsale.tokenCapReached();
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

    context('testing adjustTokenCap', function () {
      const newTokenCap = new BigNumber(10000).mul(Math.pow(10, 18));

      describe('if owner is calling', function () {
        it('success', async function () {
          await this.crowdsale.adjustTokenCap(newTokenCap, { from: owner }).should.be.fulfilled;
          (await this.crowdsale.tokenCap()).should.be.bignumber.equal(newTokenCap);
        });
      });

      describe('if third party is calling', function () {
        it('reverts', async function () {
          await assertRevert(
            this.crowdsale.adjustTokenCap(newTokenCap, { from: thirdParty })
          );
        });
      });

      describe('if invalid tokenCap', function () {
        it('reverts', async function () {
          await assertRevert(
            this.crowdsale.adjustTokenCap(0, { from: owner })
          );
        });
      });
    });

    context('testing setTierZero', function () {
      const newTierZero = ether(0.4);

      describe('if owner is calling', function () {
        it('success', async function () {
          await this.crowdsale.setTierZero(newTierZero, { from: owner }).should.be.fulfilled;
          (await this.crowdsale.tierZero()).should.be.bignumber.equal(newTierZero);
        });
      });

      describe('if third party is calling', function () {
        it('reverts', async function () {
          await assertRevert(
            this.crowdsale.setTierZero(newTierZero, { from: thirdParty })
          );
        });
      });
    });
  });
});
