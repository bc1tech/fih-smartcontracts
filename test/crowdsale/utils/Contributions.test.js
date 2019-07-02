const { assertRevert } = require('../../helpers/assertRevert');
const expectEvent = require('../../helpers/expectEvent');
const { ether } = require('../../helpers/ether');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const Contributions = artifacts.require('Contributions');

const ROLE_OPERATOR = 'operator';

contract('Contributions', function (
  [
    owner,
    minter,
    operator,
    futureMinter,
    futureOperator,
    thirdParty,
    anotherThirdParty,
    ...investors
  ]
) {
  const valueToAdd = new BigNumber(100);
  const tierLimit = ether(0.4);

  beforeEach(async function () {
    this.contributions = await Contributions.new(tierLimit, { from: owner });
    await this.contributions.addMinter(minter, { from: owner });
    await this.contributions.addOperator(operator, { from: owner });
  });

  describe('after creation', function () {
    it('tier level should be set', async function () {
      (await this.contributions.tierLimit()).should.be.bignumber.equal(tierLimit);
    });

    it('owner should be operator', async function () {
      (await this.contributions.hasRole(owner, ROLE_OPERATOR)).should.be.equal(true);
    });
  });

  context('testing adding balances', function () {
    describe('if minter is calling', function () {
      it('should success to add token amount to the address balance', async function () {
        let balance = await this.contributions.tokenBalances(thirdParty);
        balance.should.be.bignumber.equal(0);

        await this.contributions.addTokenBalance(thirdParty, valueToAdd, { from: minter });

        balance = await this.contributions.tokenBalances(thirdParty);
        balance.should.be.bignumber.equal(valueToAdd);

        await this.contributions.addTokenBalance(thirdParty, valueToAdd.mul(3), { from: minter });

        balance = await this.contributions.tokenBalances(thirdParty);
        balance.should.be.bignumber.equal(valueToAdd.mul(4));
      });

      it('should increase total sold tokens', async function () {
        let totalSoldTokens = await this.contributions.totalSoldTokens();
        totalSoldTokens.should.be.bignumber.equal(0);

        await this.contributions.addTokenBalance(thirdParty, valueToAdd, { from: minter });
        await this.contributions.addTokenBalance(thirdParty, valueToAdd.mul(3), { from: minter });

        totalSoldTokens = await this.contributions.totalSoldTokens();
        totalSoldTokens.should.be.bignumber.equal(valueToAdd.mul(4));
      });

      it('should increase array length when different address are passed', async function () {
        let contributorsLength = await this.contributions.getTokenAddressesLength();
        assert.equal(contributorsLength, 0);

        await this.contributions.addTokenBalance(thirdParty, valueToAdd, { from: minter });

        contributorsLength = await this.contributions.getTokenAddressesLength();
        assert.equal(contributorsLength, 1);

        await this.contributions.addTokenBalance(anotherThirdParty, valueToAdd, { from: minter });

        contributorsLength = await this.contributions.getTokenAddressesLength();
        assert.equal(contributorsLength, 2);
      });

      it('should not increase array length when same address is passed', async function () {
        let contributorsLength = await this.contributions.getTokenAddressesLength();
        assert.equal(contributorsLength, 0);

        await this.contributions.addTokenBalance(thirdParty, valueToAdd, { from: minter });

        contributorsLength = await this.contributions.getTokenAddressesLength();
        assert.equal(contributorsLength, 1);

        await this.contributions.addTokenBalance(thirdParty, valueToAdd, { from: minter });

        contributorsLength = await this.contributions.getTokenAddressesLength();
        assert.equal(contributorsLength, 1);
      });

      it('should cycle addresses and have the right value set', async function () {
        await this.contributions.addTokenBalance(owner, valueToAdd.mul(3), { from: minter });
        await this.contributions.addTokenBalance(thirdParty, valueToAdd.mul(4), { from: minter });
        await this.contributions.addTokenBalance(anotherThirdParty, valueToAdd, { from: minter });
        await this.contributions.addTokenBalance(anotherThirdParty, valueToAdd, { from: minter });

        const balances = [];
        balances[owner] = await this.contributions.tokenBalances(owner);
        balances[thirdParty] = await this.contributions.tokenBalances(thirdParty);
        balances[anotherThirdParty] = await this.contributions.tokenBalances(anotherThirdParty);

        const contributorsLength = (await this.contributions.getTokenAddressesLength()).valueOf();

        for (let i = 0; i < contributorsLength; i++) {
          const address = await this.contributions.tokenAddresses(i);
          const balance = await this.contributions.tokenBalances(address);

          balance.should.be.bignumber.equal(balances[address]);
        }
      });
    });

    describe('if third party is calling', function () {
      it('reverts and fail to add token amount to the address balance', async function () {
        let balance = await this.contributions.tokenBalances(thirdParty);
        assert.equal(balance, 0);

        await assertRevert(
          this.contributions.addTokenBalance(thirdParty, valueToAdd, { from: thirdParty })
        );

        balance = await this.contributions.tokenBalances(thirdParty);
        assert.equal(balance, 0);
      });
    });
  });

  context('testing adding contributions', function () {
    describe('if minter is calling', function () {
      it('should success to add ETH amount to the address balance', async function () {
        let balance = await this.contributions.ethContributions(thirdParty);
        balance.should.be.bignumber.equal(0);

        await this.contributions.addEthContribution(thirdParty, valueToAdd, { from: minter });

        balance = await this.contributions.ethContributions(thirdParty);
        balance.should.be.bignumber.equal(valueToAdd);

        await this.contributions.addEthContribution(thirdParty, valueToAdd.mul(3), { from: minter });

        balance = await this.contributions.ethContributions(thirdParty);
        balance.should.be.bignumber.equal(valueToAdd.mul(4));
      });

      it('should increase array length when different address are passed', async function () {
        let contributorsLength = await this.contributions.getEthAddressesLength();
        assert.equal(contributorsLength, 0);

        await this.contributions.addEthContribution(thirdParty, valueToAdd, { from: minter });

        contributorsLength = await this.contributions.getEthAddressesLength();
        assert.equal(contributorsLength, 1);

        await this.contributions.addEthContribution(anotherThirdParty, valueToAdd, { from: minter });

        contributorsLength = await this.contributions.getEthAddressesLength();
        assert.equal(contributorsLength, 2);
      });

      it('should not increase array length when same address is passed', async function () {
        let contributorsLength = await this.contributions.getEthAddressesLength();
        assert.equal(contributorsLength, 0);

        await this.contributions.addEthContribution(thirdParty, valueToAdd, { from: minter });

        contributorsLength = await this.contributions.getEthAddressesLength();
        assert.equal(contributorsLength, 1);

        await this.contributions.addEthContribution(thirdParty, valueToAdd, { from: minter });

        contributorsLength = await this.contributions.getEthAddressesLength();
        assert.equal(contributorsLength, 1);
      });

      it('should cycle addresses and have the right value set', async function () {
        await this.contributions.addEthContribution(owner, valueToAdd.mul(3), { from: minter });
        await this.contributions.addEthContribution(thirdParty, valueToAdd.mul(4), { from: minter });
        await this.contributions.addEthContribution(anotherThirdParty, valueToAdd, { from: minter });
        await this.contributions.addEthContribution(anotherThirdParty, valueToAdd, { from: minter });

        const balances = [];
        balances[owner] = await this.contributions.ethContributions(owner);
        balances[thirdParty] = await this.contributions.ethContributions(thirdParty);
        balances[anotherThirdParty] = await this.contributions.ethContributions(anotherThirdParty);

        const contributorsLength = (await this.contributions.getEthAddressesLength()).valueOf();

        for (let i = 0; i < contributorsLength; i++) {
          const address = await this.contributions.ethAddresses(i);
          const balance = await this.contributions.ethContributions(address);

          balance.should.be.bignumber.equal(balances[address]);
        }
      });
    });

    describe('if third party is calling', function () {
      it('reverts and fail to add ETH amount to the address balance', async function () {
        let balance = await this.contributions.ethContributions(thirdParty);
        assert.equal(balance, 0);

        await assertRevert(
          this.contributions.addEthContribution(thirdParty, valueToAdd, { from: thirdParty })
        );

        balance = await this.contributions.ethContributions(thirdParty);
        assert.equal(balance, 0);
      });
    });
  });

  context('testing handling whitelist', function () {
    describe('if operator is calling', function () {
      describe('if adding tier 1 or 2', function () {
        it('success', async function () {
          await this.contributions.addToWhitelist(investors[0], 1, { from: operator }).should.be.fulfilled;
          await this.contributions.addToWhitelist(investors[1], 2, { from: operator }).should.be.fulfilled;
        });

        it('tier should return right values', async function () {
          await this.contributions.addToWhitelist(investors[0], 1, { from: operator });
          (await this.contributions.whitelistTier(investors[0])).should.be.bignumber.equal(1);

          await this.contributions.addToWhitelist(investors[1], 2, { from: operator });
          (await this.contributions.whitelistTier(investors[1])).should.be.bignumber.equal(2);
        });

        it('list should have right values', async function () {
          await this.contributions.addToWhitelist(investors[0], 1, { from: operator });
          let whitelistedAddresses = await this.contributions.getWhitelistedAddresses(1);
          whitelistedAddresses.length.should.be.equal(1);
          whitelistedAddresses[0].should.be.equal(investors[0]);

          await this.contributions.addToWhitelist(investors[1], 2, { from: operator });
          whitelistedAddresses = await this.contributions.getWhitelistedAddresses(2);
          whitelistedAddresses.length.should.be.equal(1);
          whitelistedAddresses[0].should.be.equal(investors[1]);

          await this.contributions.addToWhitelist(investors[0], 2, { from: operator });
          whitelistedAddresses = await this.contributions.getWhitelistedAddresses(1);
          whitelistedAddresses.length.should.be.equal(0);
          whitelistedAddresses = await this.contributions.getWhitelistedAddresses(2);
          whitelistedAddresses.length.should.be.equal(2);
          whitelistedAddresses[0].should.be.equal(investors[0]);
          whitelistedAddresses[1].should.be.equal(investors[1]);

          await this.contributions.addToWhitelist(investors[2], 2, { from: operator });
          whitelistedAddresses = await this.contributions.getWhitelistedAddresses(1);
          whitelistedAddresses.length.should.be.equal(0);
          whitelistedAddresses = await this.contributions.getWhitelistedAddresses(2);
          whitelistedAddresses.length.should.be.equal(3);
          whitelistedAddresses[0].should.be.equal(investors[0]);
          whitelistedAddresses[1].should.be.equal(investors[1]);
          whitelistedAddresses[2].should.be.equal(investors[2]);

          // invalid tier
          whitelistedAddresses = await this.contributions.getWhitelistedAddresses(0);
          whitelistedAddresses.length.should.be.equal(0);
          whitelistedAddresses = await this.contributions.getWhitelistedAddresses(999);
          whitelistedAddresses.length.should.be.equal(0);
        });
      });

      describe('removing from tier', function () {
        it('success', async function () {
          await this.contributions.addToWhitelist(investors[0], 1, { from: operator }).should.be.fulfilled;
          await this.contributions.removeFromWhitelist(investors[0], { from: operator }).should.be.fulfilled;
        });

        it('tier should return right values', async function () {
          await this.contributions.addToWhitelist(investors[0], 1, { from: operator });
          (await this.contributions.whitelistTier(investors[0])).should.be.bignumber.equal(1);

          await this.contributions.removeFromWhitelist(investors[0], { from: operator });
          (await this.contributions.whitelistTier(investors[0])).should.be.bignumber.equal(0);

          await this.contributions.addToWhitelist(investors[1], 2, { from: operator });
          (await this.contributions.whitelistTier(investors[1])).should.be.bignumber.equal(2);

          await this.contributions.removeFromWhitelist(investors[1], { from: operator });
          (await this.contributions.whitelistTier(investors[1])).should.be.bignumber.equal(0);
        });

        it('list should have right values', async function () {
          await this.contributions.addToWhitelist(investors[0], 1, { from: operator });
          let whitelistedAddresses = await this.contributions.getWhitelistedAddresses(1);
          whitelistedAddresses.length.should.be.equal(1);
          whitelistedAddresses[0].should.be.equal(investors[0]);

          await this.contributions.removeFromWhitelist(investors[0], { from: operator });
          whitelistedAddresses = await this.contributions.getWhitelistedAddresses(1);
          whitelistedAddresses.length.should.be.equal(0);

          await this.contributions.addToWhitelist(investors[1], 2, { from: operator });
          await this.contributions.addToWhitelist(investors[2], 2, { from: operator });
          whitelistedAddresses = await this.contributions.getWhitelistedAddresses(2);
          whitelistedAddresses.length.should.be.equal(2);

          await this.contributions.removeFromWhitelist(investors[1], { from: operator });
          whitelistedAddresses = await this.contributions.getWhitelistedAddresses(2);
          whitelistedAddresses.length.should.be.equal(1);
          whitelistedAddresses[0].should.be.equal(investors[2]);

          // invalid tier
          whitelistedAddresses = await this.contributions.getWhitelistedAddresses(0);
          whitelistedAddresses.length.should.be.equal(0);
          whitelistedAddresses = await this.contributions.getWhitelistedAddresses(999);
          whitelistedAddresses.length.should.be.equal(0);
        });
      });

      describe('adding then removing and adding again', function () {
        it('tier should return right values', async function () {
          await this.contributions.addToWhitelist(investors[0], 1, { from: operator });
          (await this.contributions.whitelistTier(investors[0])).should.be.bignumber.equal(1);

          await this.contributions.removeFromWhitelist(investors[0], { from: operator });
          (await this.contributions.whitelistTier(investors[0])).should.be.bignumber.equal(0);

          await this.contributions.addToWhitelist(investors[0], 1, { from: operator });
          (await this.contributions.whitelistTier(investors[0])).should.be.bignumber.equal(1);
        });

        it('list should have right values', async function () {
          await this.contributions.addToWhitelist(investors[0], 1, { from: operator });
          let whitelistedAddresses = await this.contributions.getWhitelistedAddresses(1);
          whitelistedAddresses.length.should.be.equal(1);
          whitelistedAddresses[0].should.be.equal(investors[0]);

          await this.contributions.removeFromWhitelist(investors[0], { from: operator });
          whitelistedAddresses = await this.contributions.getWhitelistedAddresses(1);
          whitelistedAddresses.length.should.be.equal(0);

          await this.contributions.addToWhitelist(investors[0], 1, { from: operator });
          whitelistedAddresses = await this.contributions.getWhitelistedAddresses(1);
          whitelistedAddresses.length.should.be.equal(1);
          whitelistedAddresses[0].should.be.equal(investors[0]);
        });
      });
    });

    describe('if third party is calling', function () {
      it('reverts and fail to add and remove from whitelist', async function () {
        await assertRevert(
          this.contributions.addToWhitelist(investors[0], 1, { from: thirdParty })
        );

        await this.contributions.addToWhitelist(investors[0], 1, { from: operator });
        await assertRevert(
          this.contributions.removeFromWhitelist(investors[1], { from: thirdParty })
        );
      });
    });

    describe('if invalid tier level', function () {
      it('reverts', async function () {
        await assertRevert(
          this.contributions.addToWhitelist(investors[0], 0, { from: operator })
        );

        await assertRevert(
          this.contributions.addToWhitelist(investors[0], 999, { from: operator })
        );
      });
    });
  });

  context('testing set new tier limit', function () {
    const newTierLimit = ether(0.5);

    describe('if operator is calling', function () {
      it('success', async function () {
        await this.contributions.setTierLimit(newTierLimit, { from: operator }).should.be.fulfilled;
        (await this.contributions.tierLimit()).should.be.bignumber.equal(newTierLimit);
      });
    });

    describe('if third party is calling', function () {
      it('reverts', async function () {
        await assertRevert(
          this.contributions.setTierLimit(newTierLimit, { from: thirdParty })
        );
      });
    });

    describe('if invalid tier level', function () {
      it('reverts', async function () {
        await assertRevert(
          this.contributions.setTierLimit(0, { from: operator })
        );
      });
    });
  });

  context('test RBAC functions', function () {
    context('testing OperatorRole', function () {
      describe('in normal conditions', function () {
        it('allows owner to add a operator', async function () {
          await this.contributions.addOperator(futureOperator, { from: owner }).should.be.fulfilled;
        });

        it('allows owner to remove a operator', async function () {
          await this.contributions.addOperator(futureOperator, { from: owner }).should.be.fulfilled;
          await this.contributions.removeOperator(futureOperator, { from: owner }).should.be.fulfilled;
        });

        it('announces a RoleAdded event on addRole', async function () {
          await expectEvent.inTransaction(
            this.contributions.addOperator(futureOperator, { from: owner }),
            'RoleAdded'
          );
        });

        it('announces a RoleRemoved event on removeRole', async function () {
          await expectEvent.inTransaction(
            this.contributions.removeOperator(operator, { from: owner }),
            'RoleRemoved'
          );
        });
      });

      describe('in adversarial conditions', function () {
        it('does not allow "thirdParty" except owner to add a operator', async function () {
          await assertRevert(
            this.contributions.addOperator(futureOperator, { from: operator })
          );
          await assertRevert(
            this.contributions.addOperator(futureOperator, { from: thirdParty })
          );
        });

        it('does not allow "thirdParty" except owner to remove a operator', async function () {
          await this.contributions.addOperator(futureOperator, { from: owner }).should.be.fulfilled;
          await assertRevert(
            this.contributions.removeOperator(futureOperator, { from: operator })
          );
          await assertRevert(
            this.contributions.removeOperator(futureOperator, { from: thirdParty })
          );
        });
      });
    });

    context('testing MinterRole', function () {
      describe('in normal conditions', function () {
        it('allows owner to add a minter', async function () {
          await this.contributions.addMinter(futureMinter, { from: owner }).should.be.fulfilled;
        });

        it('allows owner to remove a minter', async function () {
          await this.contributions.addMinter(futureMinter, { from: owner }).should.be.fulfilled;
          await this.contributions.removeMinter(futureMinter, { from: owner }).should.be.fulfilled;
        });

        it('announces a RoleAdded event on addRole', async function () {
          await expectEvent.inTransaction(
            this.contributions.addMinter(futureMinter, { from: owner }),
            'RoleAdded'
          );
        });

        it('announces a RoleRemoved event on removeRole', async function () {
          await expectEvent.inTransaction(
            this.contributions.removeMinter(minter, { from: owner }),
            'RoleRemoved'
          );
        });
      });

      describe('in adversarial conditions', function () {
        it('does not allow "thirdParty" except owner to add a minter', async function () {
          await assertRevert(
            this.contributions.addMinter(futureMinter, { from: minter })
          );
          await assertRevert(
            this.contributions.addMinter(futureMinter, { from: thirdParty })
          );
        });

        it('does not allow "thirdParty" except owner to remove a minter', async function () {
          await this.contributions.addMinter(futureMinter, { from: owner }).should.be.fulfilled;
          await assertRevert(
            this.contributions.removeMinter(futureMinter, { from: minter })
          );
          await assertRevert(
            this.contributions.removeMinter(futureMinter, { from: thirdParty })
          );
        });
      });
    });
  });
});
