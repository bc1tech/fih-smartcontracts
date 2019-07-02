const { duration, increaseTimeTo } = require('../../helpers/increaseTime');
const { assertRevert } = require('../../helpers/assertRevert');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

function shouldBehaveLikeTimedBonusCrowdsale ([owner, investor, purchaser, thirdParty], rate, value) {
  let tokenCap;
  let cap;

  beforeEach(async function () {
    tokenCap = await this.crowdsale.tokenCap();
    cap = tokenCap.div(rate);

    this.bonusDatesStruct = {
      'firstPhase': this.openingTime + duration.days(1),
      'secondPhase': this.openingTime + duration.weeks(2),
      'thirdPhase': this.openingTime + duration.weeks(3),
      'fourthPhase': this.openingTime + duration.weeks(4),
    };

    this.bonusRatesStruct = {
      'firstPhase': new BigNumber(80),
      'secondPhase': new BigNumber(15),
      'thirdPhase': new BigNumber(10),
      'fourthPhase': new BigNumber(5),
    };

    this.bonusDatesArray = [
      this.bonusDatesStruct.firstPhase,
      this.bonusDatesStruct.secondPhase,
      this.bonusDatesStruct.thirdPhase,
      this.bonusDatesStruct.fourthPhase,
    ];

    this.bonusRatesArray = [
      this.bonusRatesStruct.firstPhase,
      this.bonusRatesStruct.secondPhase,
      this.bonusRatesStruct.thirdPhase,
      this.bonusRatesStruct.fourthPhase,
    ];
  });

  context('setting bonus rates', function () {
    describe('before opening time', function () {
      describe('if setting right values', function () {
        it('success', async function () {
          await this.crowdsale.setBonusRates(this.bonusDatesArray, this.bonusRatesArray).should.be.fulfilled;

          for (let i = 0; i < this.bonusDatesArray.length; i++) {
            const date = await this.crowdsale.bonusDates(i);
            const rate = await this.crowdsale.bonusRates(i);

            date.should.be.bignumber.equal(this.bonusDatesArray[i]);
            rate.should.be.bignumber.equal(this.bonusRatesArray[i]);
          }
        });
      });

      describe('if thirdParty is calling', function () {
        it('reverts', async function () {
          await assertRevert(
            this.crowdsale.setBonusRates(
              this.bonusDatesArray,
              this.bonusRatesArray,
              { from: thirdParty }
            )
          );
        });
      });

      describe('if unordered dates array', function () {
        it('reverts', async function () {
          let wrongBonusDatesArray = [
            this.bonusDatesStruct.secondPhase,
            this.bonusDatesStruct.fourthPhase,
            this.bonusDatesStruct.thirdPhase,
            this.bonusDatesStruct.firstPhase,
          ];

          await assertRevert(
            this.crowdsale.setBonusRates(wrongBonusDatesArray, this.bonusRatesArray)
          );

          wrongBonusDatesArray = [
            this.bonusDatesStruct.fourthPhase,
            this.bonusDatesStruct.secondPhase,
            this.bonusDatesStruct.thirdPhase,
            this.bonusDatesStruct.firstPhase,
          ];

          await assertRevert(
            this.crowdsale.setBonusRates(wrongBonusDatesArray, this.bonusRatesArray)
          );
        });
      });

      describe('if wrong arrays length', function () {
        it('reverts', async function () {
          const wrongBonusDatesArray = [
            this.bonusDatesStruct.secondPhase,
            this.bonusDatesStruct.thirdPhase,
          ];

          await assertRevert(
            this.crowdsale.setBonusRates(wrongBonusDatesArray, this.bonusRatesArray)
          );

          const wrongRatesArray = [
            new BigNumber(15),
            new BigNumber(10),
          ];

          await assertRevert(
            this.crowdsale.setBonusRates(this.bonusDatesArray, wrongRatesArray)
          );

          await assertRevert(
            this.crowdsale.setBonusRates(wrongBonusDatesArray, wrongRatesArray)
          );
        });
      });
    });

    describe('after opening time', function () {
      it('reverts', async function () {
        await increaseTimeTo(this.openingTime);
        await assertRevert(
          this.crowdsale.setBonusRates(this.bonusDatesArray, this.bonusRatesArray)
        );
      });
    });
  });

  context('accepting payments', function () {
    beforeEach(async function () {
      await this.crowdsale.setBonusRates(this.bonusDatesArray, this.bonusRatesArray);
    });

    describe('in first phase', function () {
      beforeEach(async function () {
        await increaseTimeTo(this.openingTime);
      });

      it('should have right bonus amount', async function () {
        (await this.crowdsale.getCurrentBonus()).should.be.bignumber.equal(this.bonusRatesStruct.firstPhase);
      });

      describe('if trying to buy more than total tokens', function () {
        it('reverts', async function () {
          await assertRevert(this.crowdsale.buyTokens(investor, { value: cap, from: investor }));
        });
      });

      it('user should have right tokens number', async function () {
        let userBalance = await this.token.balanceOf(investor);
        userBalance.should.be.bignumber.equal(0);

        await this.crowdsale.buyTokens(investor, { value, from: investor });

        const expectedTokens = value.mul(rate);
        const expectedBonus = expectedTokens.mul(this.bonusRatesStruct.firstPhase).div(100);

        userBalance = await this.token.balanceOf(investor);
        userBalance.should.be.bignumber.equal(expectedTokens.add(expectedBonus));
      });

      it('should increase sold tokens', async function () {
        let soldTokens = await this.crowdsale.soldTokens();
        soldTokens.should.be.bignumber.equal(0);

        await this.crowdsale.buyTokens(investor, { value, from: investor });

        const expectedTokens = value.mul(rate);
        const expectedBonus = expectedTokens.mul(this.bonusRatesStruct.firstPhase).div(100);

        soldTokens = await this.crowdsale.soldTokens();
        soldTokens.should.be.bignumber.equal(expectedTokens.add(expectedBonus));
      });
    });

    describe('in second phase', function () {
      beforeEach(async function () {
        await increaseTimeTo(this.bonusDatesStruct.firstPhase + duration.seconds(1));
      });

      it('should have right bonus amount', async function () {
        (await this.crowdsale.getCurrentBonus()).should.be.bignumber.equal(this.bonusRatesStruct.secondPhase);
      });

      describe('if trying to buy more than total tokens', function () {
        it('reverts', async function () {
          await assertRevert(this.crowdsale.buyTokens(investor, { value: cap, from: investor }));
        });
      });

      it('user should have right tokens number', async function () {
        let userBalance = await this.token.balanceOf(investor);
        userBalance.should.be.bignumber.equal(0);

        await this.crowdsale.buyTokens(investor, { value, from: investor });

        const expectedTokens = value.mul(rate);
        const expectedBonus = expectedTokens.mul(this.bonusRatesStruct.secondPhase).div(100);

        userBalance = await this.token.balanceOf(investor);
        userBalance.should.be.bignumber.equal(expectedTokens.add(expectedBonus));
      });

      it('should increase sold tokens', async function () {
        let soldTokens = await this.crowdsale.soldTokens();
        soldTokens.should.be.bignumber.equal(0);

        await this.crowdsale.buyTokens(investor, { value, from: investor });

        const expectedTokens = value.mul(rate);
        const expectedBonus = expectedTokens.mul(this.bonusRatesStruct.secondPhase).div(100);

        soldTokens = await this.crowdsale.soldTokens();
        soldTokens.should.be.bignumber.equal(expectedTokens.add(expectedBonus));
      });
    });

    describe('in third phase', function () {
      beforeEach(async function () {
        await increaseTimeTo(this.bonusDatesStruct.secondPhase + duration.seconds(1));
      });

      it('should have right bonus amount', async function () {
        (await this.crowdsale.getCurrentBonus()).should.be.bignumber.equal(this.bonusRatesStruct.thirdPhase);
      });

      describe('if trying to buy more than total tokens', function () {
        it('reverts', async function () {
          await assertRevert(this.crowdsale.buyTokens(investor, { value: cap, from: investor }));
        });
      });

      it('user should have right tokens number', async function () {
        let userBalance = await this.token.balanceOf(investor);
        userBalance.should.be.bignumber.equal(0);

        await this.crowdsale.buyTokens(investor, { value, from: investor });

        const expectedTokens = value.mul(rate);
        const expectedBonus = expectedTokens.mul(this.bonusRatesStruct.thirdPhase).div(100);

        userBalance = await this.token.balanceOf(investor);
        userBalance.should.be.bignumber.equal(expectedTokens.add(expectedBonus));
      });

      it('should increase sold tokens', async function () {
        let soldTokens = await this.crowdsale.soldTokens();
        soldTokens.should.be.bignumber.equal(0);

        await this.crowdsale.buyTokens(investor, { value, from: investor });

        const expectedTokens = value.mul(rate);
        const expectedBonus = expectedTokens.mul(this.bonusRatesStruct.thirdPhase).div(100);

        soldTokens = await this.crowdsale.soldTokens();
        soldTokens.should.be.bignumber.equal(expectedTokens.add(expectedBonus));
      });
    });

    describe('in fourth phase', function () {
      beforeEach(async function () {
        await increaseTimeTo(this.bonusDatesStruct.thirdPhase + duration.seconds(1));
      });

      it('should have right bonus amount', async function () {
        (await this.crowdsale.getCurrentBonus()).should.be.bignumber.equal(this.bonusRatesStruct.fourthPhase);
      });

      describe('if trying to buy more than total tokens', function () {
        it('reverts', async function () {
          await assertRevert(this.crowdsale.buyTokens(investor, { value: cap, from: investor }));
        });
      });

      it('user should have right tokens number', async function () {
        let userBalance = await this.token.balanceOf(investor);
        userBalance.should.be.bignumber.equal(0);

        await this.crowdsale.buyTokens(investor, { value, from: investor });

        const expectedTokens = value.mul(rate);
        const expectedBonus = expectedTokens.mul(this.bonusRatesStruct.fourthPhase).div(100);

        userBalance = await this.token.balanceOf(investor);
        userBalance.should.be.bignumber.equal(expectedTokens.add(expectedBonus));
      });

      it('should increase sold tokens', async function () {
        let soldTokens = await this.crowdsale.soldTokens();
        soldTokens.should.be.bignumber.equal(0);

        await this.crowdsale.buyTokens(investor, { value, from: investor });

        const expectedTokens = value.mul(rate);
        const expectedBonus = expectedTokens.mul(this.bonusRatesStruct.fourthPhase).div(100);

        soldTokens = await this.crowdsale.soldTokens();
        soldTokens.should.be.bignumber.equal(expectedTokens.add(expectedBonus));
      });
    });

    describe('participating in each round', function () {
      it('user should have right tokens number', async function () {
        let userBalance = await this.token.balanceOf(investor);
        userBalance.should.be.bignumber.equal(0);

        await increaseTimeTo(this.openingTime);
        await this.crowdsale.buyTokens(investor, { value, from: investor });

        let currentExpectedTokens = value.mul(rate);
        let currentExpectedBonus = currentExpectedTokens.mul(this.bonusRatesStruct.firstPhase).div(100);
        let expectedTokens = currentExpectedTokens;
        let expectedBonus = currentExpectedBonus;

        await increaseTimeTo(this.bonusDatesStruct.firstPhase);
        await this.crowdsale.buyTokens(investor, { value, from: investor });

        currentExpectedTokens = value.mul(rate);
        currentExpectedBonus = currentExpectedTokens.mul(this.bonusRatesStruct.secondPhase).div(100);
        expectedTokens = expectedTokens.add(currentExpectedTokens);
        expectedBonus = expectedBonus.add(currentExpectedBonus);

        await increaseTimeTo(this.bonusDatesStruct.secondPhase);
        await this.crowdsale.buyTokens(investor, { value, from: investor });

        currentExpectedTokens = value.mul(rate);
        currentExpectedBonus = currentExpectedTokens.mul(this.bonusRatesStruct.thirdPhase).div(100);
        expectedTokens = expectedTokens.add(currentExpectedTokens);
        expectedBonus = expectedBonus.add(currentExpectedBonus);

        await increaseTimeTo(this.bonusDatesStruct.thirdPhase);
        await this.crowdsale.buyTokens(investor, { value, from: investor });

        currentExpectedTokens = value.mul(rate);
        currentExpectedBonus = currentExpectedTokens.mul(this.bonusRatesStruct.fourthPhase).div(100);
        expectedTokens = expectedTokens.add(currentExpectedTokens);
        expectedBonus = expectedBonus.add(currentExpectedBonus);

        await increaseTimeTo(this.bonusDatesStruct.fourthPhase);
        await this.crowdsale.buyTokens(investor, { value, from: investor });

        currentExpectedTokens = value.mul(rate);
        currentExpectedBonus = 0;
        expectedTokens = expectedTokens.add(currentExpectedTokens);
        expectedBonus = expectedBonus.add(currentExpectedBonus);

        userBalance = await this.token.balanceOf(investor);
        userBalance.should.be.bignumber.equal(expectedTokens.add(expectedBonus));
      });

      it('should increase sold tokens', async function () {
        let soldTokens = await this.crowdsale.soldTokens();
        soldTokens.should.be.bignumber.equal(0);

        await increaseTimeTo(this.openingTime);
        await this.crowdsale.buyTokens(investor, { value, from: investor });

        let currentExpectedTokens = value.mul(rate);
        let currentExpectedBonus = currentExpectedTokens.mul(this.bonusRatesStruct.firstPhase).div(100);
        let expectedTokens = currentExpectedTokens;
        let expectedBonus = currentExpectedBonus;

        await increaseTimeTo(this.bonusDatesStruct.firstPhase);
        await this.crowdsale.buyTokens(investor, { value, from: investor });

        currentExpectedTokens = value.mul(rate);
        currentExpectedBonus = currentExpectedTokens.mul(this.bonusRatesStruct.secondPhase).div(100);
        expectedTokens = expectedTokens.add(currentExpectedTokens);
        expectedBonus = expectedBonus.add(currentExpectedBonus);

        await increaseTimeTo(this.bonusDatesStruct.secondPhase);
        await this.crowdsale.buyTokens(investor, { value, from: investor });

        currentExpectedTokens = value.mul(rate);
        currentExpectedBonus = currentExpectedTokens.mul(this.bonusRatesStruct.thirdPhase).div(100);
        expectedTokens = expectedTokens.add(currentExpectedTokens);
        expectedBonus = expectedBonus.add(currentExpectedBonus);

        await increaseTimeTo(this.bonusDatesStruct.thirdPhase);
        await this.crowdsale.buyTokens(investor, { value, from: investor });

        currentExpectedTokens = value.mul(rate);
        currentExpectedBonus = currentExpectedTokens.mul(this.bonusRatesStruct.fourthPhase).div(100);
        expectedTokens = expectedTokens.add(currentExpectedTokens);
        expectedBonus = expectedBonus.add(currentExpectedBonus);

        await increaseTimeTo(this.bonusDatesStruct.fourthPhase);
        await this.crowdsale.buyTokens(investor, { value, from: investor });

        currentExpectedTokens = value.mul(rate);
        currentExpectedBonus = 0;
        expectedTokens = expectedTokens.add(currentExpectedTokens);
        expectedBonus = expectedBonus.add(currentExpectedBonus);

        soldTokens = await this.crowdsale.soldTokens();
        soldTokens.should.be.bignumber.equal(expectedTokens.add(expectedBonus));
      });
    });

    describe('multiple users participating', function () {
      it('should increase sold tokens', async function () {
        let soldTokens = await this.crowdsale.soldTokens();
        soldTokens.should.be.bignumber.equal(0);

        await increaseTimeTo(this.openingTime);
        await this.crowdsale.buyTokens(investor, { value, from: investor });
        await this.crowdsale.buyTokens(purchaser, { value, from: purchaser });

        let currentExpectedTokens = value.mul(rate);
        let currentExpectedBonus = currentExpectedTokens.mul(this.bonusRatesStruct.firstPhase).div(100);
        let expectedTokens = currentExpectedTokens;
        let expectedBonus = currentExpectedBonus;

        await increaseTimeTo(this.bonusDatesStruct.firstPhase);
        await this.crowdsale.buyTokens(investor, { value, from: investor });
        await this.crowdsale.buyTokens(purchaser, { value, from: purchaser });

        currentExpectedTokens = value.mul(rate);
        currentExpectedBonus = currentExpectedTokens.mul(this.bonusRatesStruct.secondPhase).div(100);
        expectedTokens = expectedTokens.add(currentExpectedTokens);
        expectedBonus = expectedBonus.add(currentExpectedBonus);

        await increaseTimeTo(this.bonusDatesStruct.secondPhase);
        await this.crowdsale.buyTokens(investor, { value, from: investor });
        await this.crowdsale.buyTokens(purchaser, { value, from: purchaser });

        currentExpectedTokens = value.mul(rate);
        currentExpectedBonus = currentExpectedTokens.mul(this.bonusRatesStruct.thirdPhase).div(100);
        expectedTokens = expectedTokens.add(currentExpectedTokens);
        expectedBonus = expectedBonus.add(currentExpectedBonus);

        await increaseTimeTo(this.bonusDatesStruct.thirdPhase);
        await this.crowdsale.buyTokens(investor, { value, from: investor });
        await this.crowdsale.buyTokens(purchaser, { value, from: purchaser });

        currentExpectedTokens = value.mul(rate);
        currentExpectedBonus = currentExpectedTokens.mul(this.bonusRatesStruct.fourthPhase).div(100);
        expectedTokens = expectedTokens.add(currentExpectedTokens);
        expectedBonus = expectedBonus.add(currentExpectedBonus);

        await increaseTimeTo(this.bonusDatesStruct.fourthPhase);
        await this.crowdsale.buyTokens(investor, { value, from: investor });
        await this.crowdsale.buyTokens(purchaser, { value, from: purchaser });

        currentExpectedTokens = value.mul(rate);
        currentExpectedBonus = 0;
        expectedTokens = expectedTokens.add(currentExpectedTokens);
        expectedBonus = expectedBonus.add(currentExpectedBonus);

        soldTokens = await this.crowdsale.soldTokens();
        soldTokens.should.be.bignumber.equal(expectedTokens.add(expectedBonus).mul(2));
      });
    });

    describe('after fourth phase', function () {
      beforeEach(async function () {
        await increaseTimeTo(this.bonusDatesStruct.fourthPhase + duration.seconds(1));
      });

      it('should have right bonus amount', async function () {
        (await this.crowdsale.getCurrentBonus()).should.be.bignumber.equal(0);
      });

      it('user should have right tokens number', async function () {
        let userBalance = await this.token.balanceOf(investor);
        userBalance.should.be.bignumber.equal(0);

        await this.crowdsale.buyTokens(investor, { value, from: investor });

        const expectedTokens = value.mul(rate);
        const expectedBonus = 0;

        userBalance = await this.token.balanceOf(investor);
        userBalance.should.be.bignumber.equal(expectedTokens.add(expectedBonus));
      });

      describe('if trying to buy the entire cap', function () {
        it('success', async function () {
          await this.crowdsale.buyTokens(investor, { value: cap, from: investor }).should.be.fulfilled;
        });
      });
    });
  });
}

module.exports = {
  shouldBehaveLikeTimedBonusCrowdsale,
};
