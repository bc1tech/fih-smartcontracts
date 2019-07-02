const { increaseTimeTo } = require('../../helpers/increaseTime');
const { assertRevert } = require('../../helpers/assertRevert');

const { shouldBehaveLikeTimedCrowdsale } = require('./TimedCrowdsale.behaviour');
const { shouldBehaveLikeTokenRecover } = require('eth-token-recover/test/TokenRecover.behaviour');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

function shouldBehaveDefaultICO (
  [
    owner,
    investor,
    wallet,
    purchaser,
    thirdParty,
  ],
  rate,
  minimumContribution
) {
  const value = minimumContribution;

  context('like a TimedCrowdsale', async function () {
    beforeEach(async function () {
      // setting tier 2 to be able sending big amounts
      await this.contributions.addToWhitelist(investor, 2);
      await this.contributions.addToWhitelist(purchaser, 2);
    });

    shouldBehaveLikeTimedCrowdsale([owner, investor, wallet, purchaser], rate, value);
  });

  context('like a DefaultICO', function () {
    describe('high-level purchase', function () {
      beforeEach(async function () {
        await increaseTimeTo(this.openingTime);

        // setting tier 2 to be able sending big amounts
        await this.contributions.addToWhitelist(investor, 2);
        await this.contributions.addToWhitelist(purchaser, 2);
      });

      it('should add beneficiary to contributions token addresses list', async function () {
        let contributorsLength = await this.contributions.getTokenAddressesLength();
        assert.equal(contributorsLength, 0);

        const pre = await this.contributions.tokenBalances(investor);
        pre.should.be.bignumber.equal(0);

        await this.crowdsale.sendTransaction({ value, from: investor });

        const post = await this.contributions.tokenBalances(investor);
        post.should.be.bignumber.equal(value.mul(rate));

        contributorsLength = await this.contributions.getTokenAddressesLength();
        assert.equal(contributorsLength, 1);
      });

      it('should add beneficiary to contributions ETH addresses list', async function () {
        let contributorsLength = await this.contributions.getEthAddressesLength();
        assert.equal(contributorsLength, 0);

        const pre = await this.contributions.ethContributions(investor);
        pre.should.be.bignumber.equal(0);

        await this.crowdsale.sendTransaction({ value, from: investor });

        const post = await this.contributions.ethContributions(investor);
        post.should.be.bignumber.equal(value);

        contributorsLength = await this.contributions.getEthAddressesLength();
        assert.equal(contributorsLength, 1);
      });

      it('should fail if less than minimum contribution', async function () {
        await assertRevert(
          this.crowdsale.sendTransaction({ value: minimumContribution.sub(1), from: investor })
        );
      });

      context('checking whitelist', function () {
        let tierZeroLimit;
        let tierOneLimit;

        beforeEach(async function () {
          tierZeroLimit = await this.crowdsale.tierZero();
          tierOneLimit = await this.contributions.tierLimit();
        });

        describe('if not whitelisted', function () {
          it('success until tier 0 limit', async function () {
            await this.crowdsale.sendTransaction({ value: tierZeroLimit, from: thirdParty }).should.be.fulfilled;
          });

          it('should fail sending more than tier 0 limit', async function () {
            await assertRevert(
              this.crowdsale.sendTransaction({ value: tierZeroLimit.add(1), from: thirdParty })
            );
          });
        });

        describe('if whitelisted', function () {
          describe('with tier 2', function () {
            beforeEach(async function () {
              await this.contributions.addToWhitelist(thirdParty, 2, { from: owner });
            });

            it('should success with any value', async function () {
              await this.crowdsale.sendTransaction(
                { value: tierOneLimit.add(1), from: thirdParty }
              ).should.be.fulfilled;
            });
          });

          describe('with tier 1', function () {
            beforeEach(async function () {
              await this.contributions.addToWhitelist(thirdParty, 1, { from: owner });
            });

            it('success until tier 1 limit', async function () {
              await this.crowdsale.sendTransaction(
                { value: tierOneLimit.div(2), from: thirdParty }
              ).should.be.fulfilled;
              await this.crowdsale.sendTransaction(
                { value: tierOneLimit.div(2), from: thirdParty }
              ).should.be.fulfilled;
            });

            it('should fail sending more than tier 1 limit', async function () {
              await assertRevert(
                this.crowdsale.sendTransaction({ value: tierOneLimit.add(1), from: thirdParty })
              );
            });
          });
        });
      });
    });

    describe('low-level purchase', function () {
      beforeEach(async function () {
        await increaseTimeTo(this.openingTime);

        // setting tier 2 to be able sending big amounts
        await this.contributions.addToWhitelist(investor, 2);
        await this.contributions.addToWhitelist(purchaser, 2);
      });

      it('should add beneficiary to contributions token addresses list', async function () {
        let contributorsLength = await this.contributions.getTokenAddressesLength();
        assert.equal(contributorsLength, 0);

        const pre = await this.contributions.tokenBalances(investor);
        pre.should.be.bignumber.equal(0);

        await this.crowdsale.buyTokens(investor, { value, from: purchaser });

        const post = await this.contributions.tokenBalances(investor);
        post.should.be.bignumber.equal(value.mul(rate));

        contributorsLength = await this.contributions.getTokenAddressesLength();
        assert.equal(contributorsLength, 1);
      });

      it('should add beneficiary to contributions ETH addresses list', async function () {
        let contributorsLength = await this.contributions.getEthAddressesLength();
        assert.equal(contributorsLength, 0);

        const pre = await this.contributions.ethContributions(investor);
        pre.should.be.bignumber.equal(0);

        await this.crowdsale.buyTokens(investor, { value, from: purchaser });

        const post = await this.contributions.ethContributions(investor);
        post.should.be.bignumber.equal(value);

        contributorsLength = await this.contributions.getEthAddressesLength();
        assert.equal(contributorsLength, 1);
      });

      it('should fail if less than minimum contribution', async function () {
        await assertRevert(
          this.crowdsale.buyTokens(investor, { value: minimumContribution.sub(1), from: purchaser })
        );
      });

      context('checking whitelist', function () {
        let tierZeroLimit;
        let tierOneLimit;

        beforeEach(async function () {
          tierZeroLimit = await this.crowdsale.tierZero();
          tierOneLimit = await this.contributions.tierLimit();
        });

        describe('if not whitelisted', function () {
          it('success until tier 0 limit', async function () {
            await this.crowdsale.buyTokens(thirdParty, { value: tierZeroLimit, from: thirdParty }).should.be.fulfilled;
          });

          it('should fail sending more than tier 0 limit', async function () {
            await assertRevert(
              this.crowdsale.buyTokens(thirdParty, { value: tierZeroLimit.add(1), from: thirdParty })
            );
          });
        });

        describe('if whitelisted', function () {
          describe('with tier 2', function () {
            beforeEach(async function () {
              await this.contributions.addToWhitelist(thirdParty, 2, { from: owner });
            });

            it('should success with any value', async function () {
              await this.crowdsale.buyTokens(
                thirdParty,
                { value: tierOneLimit.add(1), from: thirdParty }
              ).should.be.fulfilled;
            });
          });

          describe('with tier 1', function () {
            beforeEach(async function () {
              await this.contributions.addToWhitelist(thirdParty, 1, { from: owner });
            });

            it('success until tier 1 limit', async function () {
              await this.crowdsale.buyTokens(
                thirdParty,
                { value: tierOneLimit.div(2), from: thirdParty }
              ).should.be.fulfilled;
              await this.crowdsale.buyTokens(
                thirdParty,
                { value: tierOneLimit.div(2), from: thirdParty }
              ).should.be.fulfilled;
            });

            it('should fail sending more than tier 1 limit', async function () {
              await assertRevert(
                this.crowdsale.buyTokens(thirdParty, { value: tierOneLimit.add(1), from: thirdParty })
              );
            });
          });
        });
      });
    });
  });

  context('like a TokenRecover', function () {
    beforeEach(async function () {
      this.instance = this.crowdsale;
    });

    shouldBehaveLikeTokenRecover([owner, thirdParty]);
  });
}

module.exports = {
  shouldBehaveDefaultICO,
};
