const { assertRevert } = require('../../helpers/assertRevert');

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

function shouldBehaveLikeMintAndLockCrowdsale ([owner, investor, wallet, purchaser], rate, bonusRate, value) {
  const expectedTokenAmount = rate.mul(value);
  const expectedBonusAmount = expectedTokenAmount.mul(bonusRate).div(100);
  const expectedTotalAmount = expectedTokenAmount.add(expectedBonusAmount);

  describe('accepting payments', function () {
    it('should accept payments', async function () {
      await this.crowdsale.sendTransaction({ value: value, from: investor }).should.be.fulfilled;
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.fulfilled;
    });

    it('should reject payments if crowdsale has no minting permission', async function () {
      await this.token.removeMinter(this.crowdsale.address);
      await assertRevert(
        this.crowdsale.sendTransaction({ value: value, from: investor })
      );
      await assertRevert(
        this.crowdsale.buyTokens(investor, { value: value, from: purchaser })
      );
    });

    it('should reject payments if minting is finished', async function () {
      await this.token.removeMinter(this.crowdsale.address);
      await assertRevert(
        this.crowdsale.sendTransaction({ value: value, from: investor })
      );
      await assertRevert(
        this.crowdsale.buyTokens(investor, { value: value, from: purchaser })
      );
    });
  });

  describe('high-level purchase', function () {
    it('should log purchase', async function () {
      const { logs } = await this.crowdsale.sendTransaction({ value: value, from: investor });
      const event = logs.find(e => e.event === 'TokenPurchase');
      should.exist(event);
      event.args.purchaser.should.equal(investor);
      event.args.beneficiary.should.equal(investor);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTotalAmount);
    });

    it('should assign tokens to sender', async function () {
      await this.crowdsale.sendTransaction({ value: value, from: investor });
      const balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTotalAmount);
    });

    it('should lock tokens to sender', async function () {
      await this.crowdsale.sendTransaction({ value: value, from: investor });
      const balance = await this.token.lockedBalanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(wallet);
      await this.crowdsale.sendTransaction({ value, from: investor });
      const post = web3.eth.getBalance(wallet);
      post.minus(pre).should.be.bignumber.equal(value);
    });
  });

  describe('low-level purchase', function () {
    it('should log purchase', async function () {
      const { logs } = await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });
      const event = logs.find(e => e.event === 'TokenPurchase');
      should.exist(event);
      event.args.purchaser.should.equal(purchaser);
      event.args.beneficiary.should.equal(investor);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTotalAmount);
    });

    it('should assign tokens to sender', async function () {
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });
      const balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTotalAmount);
    });

    it('should lock tokens to sender', async function () {
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });
      const balance = await this.token.lockedBalanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(wallet);
      await this.crowdsale.buyTokens(investor, { value, from: purchaser });
      const post = web3.eth.getBalance(wallet);
      post.minus(pre).should.be.bignumber.equal(value);
    });
  });
}

module.exports = {
  shouldBehaveLikeMintAndLockCrowdsale,
};
