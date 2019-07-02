const { assertRevert } = require('openzeppelin-solidity/test/helpers/assertRevert');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

function shouldBehaveLikeTokenCappedCrowdsale ([investor, purchaser, thirdParty]) {
  let currentRate;
  let tokenCap;
  let cap;
  let minContribution;

  beforeEach(async function () {
    currentRate = await this.crowdsale.rate();
    tokenCap = await this.crowdsale.tokenCap();
    cap = tokenCap.div(currentRate);
    minContribution = await this.crowdsale.minimumContribution();
  });

  describe('accepting payments', function () {
    describe('high-level purchase', function () {
      it('should accept payments within cap', async function () {
        await this.crowdsale.sendTransaction({ value: cap.minus(1), from: investor }).should.be.fulfilled;
      });

      it('soldTokens should increase', async function () {
        await this.crowdsale.sendTransaction({ value: minContribution, from: investor }).should.be.fulfilled;
        await this.crowdsale.sendTransaction({ value: minContribution, from: purchaser }).should.be.fulfilled;

        const soldTokens = await this.crowdsale.soldTokens();
        soldTokens.should.be.bignumber.equal(minContribution.mul(currentRate).mul(2));
      });

      it('should reject payments outside cap', async function () {
        await assertRevert(this.crowdsale.sendTransaction({ value: cap.plus(1), from: investor }));
      });
    });

    describe('low-level purchase', function () {
      it('should accept payments within cap', async function () {
        await this.crowdsale.buyTokens(investor, { value: cap.minus(1), from: purchaser }).should.be.fulfilled;
      });

      it('soldTokens should increase', async function () {
        await this.crowdsale.buyTokens(purchaser, { value: minContribution, from: purchaser });
        await this.crowdsale.buyTokens(investor, { value: minContribution, from: purchaser });

        const soldTokens = await this.crowdsale.soldTokens();
        soldTokens.should.be.bignumber.equal(minContribution.mul(currentRate).mul(2));
      });

      it('should reject payments outside cap', async function () {
        await assertRevert(this.crowdsale.buyTokens(purchaser, { value: cap.plus(1), from: purchaser }));
      });
    });
  });

  describe('ending', function () {
    it('should not reach cap if sent under cap', async function () {
      let tokenCapReached = await this.crowdsale.tokenCapReached();
      tokenCapReached.should.equal(false);
      await this.crowdsale.sendTransaction({ value: minContribution, from: investor });
      tokenCapReached = await this.crowdsale.tokenCapReached();
      tokenCapReached.should.equal(false);
    });

    it('should not reach cap if sent just under cap', async function () {
      await this.crowdsale.sendTransaction({ value: cap.minus(1), from: purchaser });
      const tokenCapReached = await this.crowdsale.tokenCapReached();
      tokenCapReached.should.equal(false);
    });

    it('should reach cap if cap sent', async function () {
      await this.crowdsale.sendTransaction({ value: cap, from: investor });
      const tokenCapReached = await this.crowdsale.tokenCapReached();
      tokenCapReached.should.equal(true);
    });
  });
}

module.exports = {
  shouldBehaveLikeTokenCappedCrowdsale,
};
