const { increaseTimeTo } = require('../../helpers/increaseTime');
const { assertRevert } = require('../../helpers/assertRevert');

const { shouldBehaveLikeTimedCrowdsale } = require('./TimedCrowdsale.behaviour');
const { shouldBehaveLikeTokenRecover } = require('eth-token-recover/test/TokenRecover.behaviour');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

function shouldBehaveDefaultCrowdsale (
  [
    owner,
    investor,
    wallet,
    purchaser,
    thirdParty,
  ],
  rate,
  minimumContribution,
  value
) {
  context('like a TimedCrowdsale', async function () {
    shouldBehaveLikeTimedCrowdsale([owner, investor, wallet, purchaser], rate, value);
  });

  context('like a DefaultCrowdsale', function () {
    describe('high-level purchase', function () {
      beforeEach(async function () {
        await increaseTimeTo(this.openingTime);
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

      describe('if not whitelisted', function () {
        it('should fail', async function () {
          await assertRevert(
            this.crowdsale.sendTransaction({ value: value, from: thirdParty })
          );
        });
      });

      describe('if whitelisted', function () {
        let tierLimit;

        beforeEach(async function () {
          tierLimit = await this.contributions.tierLimit();
        });

        describe('with tier 2', function () {
          beforeEach(async function () {
            await this.contributions.addToWhitelist(thirdParty, 2, { from: owner });
          });

          it('should success with any value', async function () {
            await this.crowdsale.sendTransaction({ value: tierLimit.add(1), from: thirdParty }).should.be.fulfilled;
          });
        });

        describe('with tier 1', function () {
          beforeEach(async function () {
            await this.contributions.addToWhitelist(thirdParty, 1, { from: owner });
          });

          it('success until tier limit', async function () {
            await this.crowdsale.sendTransaction({ value: tierLimit.div(2), from: thirdParty }).should.be.fulfilled;
            await this.crowdsale.sendTransaction({ value: tierLimit.div(2), from: thirdParty }).should.be.fulfilled;
          });

          it('should fail sending more than tier limit', async function () {
            await assertRevert(
              this.crowdsale.sendTransaction({ value: tierLimit.add(1), from: thirdParty })
            );
          });
        });
      });
    });

    describe('low-level purchase', function () {
      beforeEach(async function () {
        await increaseTimeTo(this.openingTime);
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

      describe('if not whitelisted', function () {
        it('should fail', async function () {
          await assertRevert(
            this.crowdsale.buyTokens(thirdParty, { value: value, from: thirdParty })
          );
        });
      });

      describe('if whitelisted', function () {
        let tierLimit;

        beforeEach(async function () {
          tierLimit = await this.contributions.tierLimit();
        });

        describe('with tier 2', function () {
          beforeEach(async function () {
            await this.contributions.addToWhitelist(thirdParty, 2, { from: owner });
          });

          it('should success with any value', async function () {
            await this.crowdsale.buyTokens(
              thirdParty,
              { value: tierLimit.add(1), from: thirdParty }
            ).should.be.fulfilled;
          });
        });

        describe('with tier 1', function () {
          beforeEach(async function () {
            await this.contributions.addToWhitelist(thirdParty, 1, { from: owner });
          });

          it('success until tier limit', async function () {
            await this.crowdsale.buyTokens(
              thirdParty,
              { value: tierLimit.div(2), from: thirdParty }
            ).should.be.fulfilled;
            await this.crowdsale.buyTokens(
              thirdParty,
              { value: tierLimit.div(2), from: thirdParty }
            ).should.be.fulfilled;
          });

          it('should fail sending more than tier limit', async function () {
            await assertRevert(
              this.crowdsale.buyTokens(thirdParty, { value: tierLimit.add(1), from: thirdParty })
            );
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
  shouldBehaveDefaultCrowdsale,
};
