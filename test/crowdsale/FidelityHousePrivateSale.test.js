const { assertRevert } = require('../helpers/assertRevert');
const { duration } = require('../helpers/increaseTime');
const { latestTime } = require('../helpers/latestTime');
const { ether } = require('../helpers/ether');

const { shouldBehaveLikeTokenRecover } = require('eth-token-recover/test/TokenRecover.behaviour');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const FidelityHousePrivateSale = artifacts.require('FidelityHousePrivateSale');
const FidelityHouseToken = artifacts.require('FidelityHouseToken');
const Contributions = artifacts.require('Contributions');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('FidelityHousePrivateSale', function (
  [owner, anotherAccount, receiver1, receiver2, receiver3, thirdParty]
) {
  const addresses = [receiver1, receiver2, receiver3];
  const amounts = [
    new BigNumber(100),
    new BigNumber(200),
    new BigNumber(300),
  ];
  const bonuses = [
    new BigNumber(10),
    new BigNumber(20),
    new BigNumber(30),
  ];

  const tierLimit = ether(0.4);

  beforeEach(async function () {
    this.lockedUntil = (await latestTime()) + duration.weeks(1);

    this.token = await FidelityHouseToken.new(this.lockedUntil, { from: owner });
    this.contributions = await Contributions.new(tierLimit, { from: owner });
    this.crowdsale = await FidelityHousePrivateSale.new(
      this.token.address,
      this.contributions.address,
      { from: owner }
    );

    await this.token.addMinter(this.crowdsale.address, { from: owner });
    await this.contributions.addMinter(this.crowdsale.address, { from: owner });
  });

  context('creating a valid private sale', function () {
    describe('if valid', function () {
      it('has a valid token', async function () {
        const currentToken = await this.crowdsale.token();
        assert.equal(currentToken, this.token.address);
      });
      it('has a valid contributions', async function () {
        const currentContributions = await this.crowdsale.contributions();
        assert.equal(currentContributions, this.contributions.address);
      });
    });

    describe('if token address is the zero address', function () {
      it('reverts', async function () {
        await assertRevert(
          FidelityHousePrivateSale.new(ZERO_ADDRESS, this.contributions.address, { from: owner })
        );
      });
    });

    describe('if contributions is the zero address', function () {
      it('reverts', async function () {
        await assertRevert(
          FidelityHousePrivateSale.new(this.token.address, ZERO_ADDRESS, { from: owner })
        );
      });
    });
  });

  context('sending tokens', function () {
    describe('if owner is calling', function () {
      it('should transfer tokens for given addresses', async function () {
        for (const arrayIndex in addresses) {
          const receiverBalance = await this.token.balanceOf(addresses[arrayIndex]);
          const lockedReceiverBalance = await this.token.lockedBalanceOf(addresses[arrayIndex]);

          receiverBalance.should.be.bignumber.equal(0);
          lockedReceiverBalance.should.be.bignumber.equal(0);
        }

        await this.crowdsale.multiSend(addresses, amounts, bonuses, { from: owner });

        for (const arrayIndex in addresses) {
          const receiverBalance = await this.token.balanceOf(addresses[arrayIndex]);
          const lockedReceiverBalance = await this.token.lockedBalanceOf(addresses[arrayIndex]);

          receiverBalance.should.be.bignumber.equal(amounts[arrayIndex].add(bonuses[arrayIndex]));
          lockedReceiverBalance.should.be.bignumber.equal(amounts[arrayIndex]);
        }
      });

      it('should increase sentTokens for given addresses', async function () {
        for (const arrayIndex in addresses) {
          const sentTokens = await this.crowdsale.sentTokens(addresses[arrayIndex]);
          sentTokens.should.be.bignumber.equal(0);
        }

        await this.crowdsale.multiSend(addresses, amounts, bonuses, { from: owner });

        for (const arrayIndex in addresses) {
          const sentTokens = await this.crowdsale.sentTokens(addresses[arrayIndex]);
          sentTokens.should.be.bignumber.equal(amounts[arrayIndex].add(bonuses[arrayIndex]));
        }
      });

      it('should add beneficiary to contributions list', async function () {
        let contributorsLength = await this.contributions.getTokenAddressesLength();
        assert.equal(contributorsLength, 0);

        for (const arrayIndex in addresses) {
          const receiverBalance = await this.contributions.tokenBalances(addresses[arrayIndex]);
          receiverBalance.should.be.bignumber.equal(0);
        }

        await this.crowdsale.multiSend(addresses, amounts, bonuses, { from: owner });

        for (const arrayIndex in addresses) {
          const receiverBalance = await this.contributions.tokenBalances(addresses[arrayIndex]);
          receiverBalance.should.be.bignumber.equal(amounts[arrayIndex].add(bonuses[arrayIndex]));
        }

        contributorsLength = await this.contributions.getTokenAddressesLength();
        assert.equal(contributorsLength, addresses.length);
      });

      describe('calling twice', function () {
        it('should not transfer tokens for given addresses', async function () {
          await this.crowdsale.multiSend(addresses, amounts, bonuses, { from: owner });
          await this.crowdsale.multiSend(addresses, amounts, bonuses, { from: owner });

          for (const arrayIndex in addresses) {
            const receiverBalance = await this.token.balanceOf(addresses[arrayIndex]);
            const lockedReceiverBalance = await this.token.lockedBalanceOf(addresses[arrayIndex]);

            receiverBalance.should.be.bignumber.equal((amounts[arrayIndex].add(bonuses[arrayIndex])));
            lockedReceiverBalance.should.be.bignumber.equal(amounts[arrayIndex]);
          }
        });

        it('should not add beneficiary to contributions list', async function () {
          let contributorsLength = await this.contributions.getTokenAddressesLength();
          assert.equal(contributorsLength, 0);

          for (const arrayIndex in addresses) {
            const receiverBalance = await this.contributions.tokenBalances(addresses[arrayIndex]);
            receiverBalance.should.be.bignumber.equal(0);
          }

          await this.crowdsale.multiSend(addresses, amounts, bonuses, { from: owner });
          await this.crowdsale.multiSend(addresses, amounts, bonuses, { from: owner });

          for (const arrayIndex in addresses) {
            const receiverBalance = await this.contributions.tokenBalances(addresses[arrayIndex]);
            receiverBalance.should.be.bignumber.equal((amounts[arrayIndex].add(bonuses[arrayIndex])));
          }

          contributorsLength = await this.contributions.getTokenAddressesLength();
          assert.equal(contributorsLength, addresses.length);
        });
      });

      describe('if addresses are empty', function () {
        it('reverts', async function () {
          await assertRevert(
            this.crowdsale.multiSend([], amounts, bonuses, { from: owner })
          );
        });
      });

      describe('if amounts are empty', function () {
        it('reverts', async function () {
          await assertRevert(
            this.crowdsale.multiSend(addresses, [], bonuses, { from: owner })
          );
        });
      });

      describe('if bonuses are empty', function () {
        it('reverts', async function () {
          await assertRevert(
            this.crowdsale.multiSend(addresses, amounts, [], { from: owner })
          );
        });
      });

      describe('if arrays length is not equal to addresses length', function () {
        it('reverts', async function () {
          await assertRevert(
            this.crowdsale.multiSend([addresses[0]], amounts, bonuses, { from: owner })
          );
          await assertRevert(
            this.crowdsale.multiSend(addresses, [amounts[0]], bonuses, { from: owner })
          );
          await assertRevert(
            this.crowdsale.multiSend(addresses, amounts, [bonuses[0]], { from: owner })
          );
        });
      });
    });

    describe('if another account is calling', function () {
      it('reverts', async function () {
        await assertRevert(
          this.crowdsale.multiSend(addresses, amounts, bonuses, { from: anotherAccount })
        );
      });
    });
  });

  context('like a TokenRecover', function () {
    beforeEach(async function () {
      this.instance = this.crowdsale;
    });

    shouldBehaveLikeTokenRecover([owner, thirdParty]);
  });
});
