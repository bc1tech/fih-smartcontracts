const { assertRevert } = require('../helpers/assertRevert');
const { duration } = require('../helpers/increaseTime');
const { latestTime } = require('../helpers/latestTime');

const { shouldBehaveLikeTokenRecover } = require('eth-token-recover/test/TokenRecover.behaviour');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const FidelityHouseBounty = artifacts.require('FidelityHouseBounty');
const FidelityHouseToken = artifacts.require('FidelityHouseToken');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('FidelityHouseBounty', function (
  [owner, anotherAccount, receiver1, receiver2, receiver3, thirdParty]
) {
  const addresses = [receiver1, receiver2, receiver3];
  const amounts = [
    new BigNumber(100),
    new BigNumber(200),
    new BigNumber(300),
  ];

  beforeEach(async function () {
    this.lockedUntil = (await latestTime()) + duration.weeks(1);

    this.token = await FidelityHouseToken.new(this.lockedUntil, { from: owner });
    this.distributor = await FidelityHouseBounty.new(
      this.token.address,
      { from: owner }
    );

    await this.token.addMinter(this.distributor.address, { from: owner });
  });

  context('creating a valid bounty distribution', function () {
    describe('if valid', function () {
      it('has a valid token', async function () {
        const currentToken = await this.distributor.token();
        assert.equal(currentToken, this.token.address);
      });
    });

    describe('if token address is the zero address', function () {
      it('reverts', async function () {
        await assertRevert(
          FidelityHouseBounty.new(ZERO_ADDRESS, { from: owner })
        );
      });
    });
  });

  context('sending tokens', function () {
    describe('if owner is calling', function () {
      it('should transfer tokens for given addresses', async function () {
        for (const arrayIndex in addresses) {
          const receiverBalance = await this.token.balanceOf(addresses[arrayIndex]);
          receiverBalance.should.be.bignumber.equal(0);
        }

        await this.distributor.multiSend(addresses, amounts, { from: owner });

        for (const arrayIndex in addresses) {
          const receiverBalance = await this.token.balanceOf(addresses[arrayIndex]);
          receiverBalance.should.be.bignumber.equal(amounts[arrayIndex]);
        }
      });

      it('should increase sentTokens for given addresses', async function () {
        for (const arrayIndex in addresses) {
          const sentTokens = await this.distributor.sentTokens(addresses[arrayIndex]);
          sentTokens.should.be.bignumber.equal(0);
        }

        await this.distributor.multiSend(addresses, amounts, { from: owner });

        for (const arrayIndex in addresses) {
          const sentTokens = await this.distributor.sentTokens(addresses[arrayIndex]);
          sentTokens.should.be.bignumber.equal(amounts[arrayIndex]);
        }
      });

      describe('calling twice', function () {
        it('should not transfer tokens for given addresses', async function () {
          await this.distributor.multiSend(addresses, amounts, { from: owner });
          await this.distributor.multiSend(addresses, amounts, { from: owner });

          for (const arrayIndex in addresses) {
            const receiverBalance = await this.token.balanceOf(addresses[arrayIndex]);
            receiverBalance.should.be.bignumber.equal(amounts[arrayIndex]);
          }
        });
      });

      describe('if addresses are empty', function () {
        it('reverts', async function () {
          await assertRevert(
            this.distributor.multiSend([], amounts, { from: owner })
          );
        });
      });

      describe('if amounts are empty', function () {
        it('reverts', async function () {
          await assertRevert(
            this.distributor.multiSend(addresses, [], { from: owner })
          );
        });
      });

      describe('if amounts length is not equal to addresses length', function () {
        it('reverts', async function () {
          await assertRevert(
            this.distributor.multiSend([addresses[0]], [amounts[0], amounts[1]], { from: owner })
          );
        });
      });
    });

    describe('if another account is calling', function () {
      it('reverts', async function () {
        await assertRevert(
          this.distributor.multiSend(addresses, amounts, { from: anotherAccount })
        );
      });
    });
  });

  context('like a TokenRecover', function () {
    beforeEach(async function () {
      this.instance = this.distributor;
    });

    shouldBehaveLikeTokenRecover([owner, thirdParty]);
  });
});
