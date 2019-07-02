App = {
  hasPrivacyMode: false,
  web3Provider: null,
  contracts: {},
  instances: {},

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof ethereum !== 'undefined') {
      console.log('injected web3');
      App.web3Provider = ethereum;
      App.hasPrivacyMode = true;
    } else if (typeof web3 !== 'undefined') {
      console.log('injected web3 (legacy)');
      App.web3Provider = web3.currentProvider;
    } else {
      // set the provider you want from Web3.providers
      console.log('provided web3');
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545');
    }

    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    if (App.hasPrivacyMode) {
      App.web3Provider.enable();
    }

    $.getJSON('FidelityHouseToken.json', function (data) {
      App.contracts.Token = TruffleContract(data);
      App.contracts.Token.setProvider(App.web3Provider);
    });

    $.getJSON('Contributions.json', function (data) {
      App.contracts.Contributions = TruffleContract(data);
      App.contracts.Contributions.setProvider(App.web3Provider);
    });

    $.getJSON('FidelityHousePrivateSale.json', function (data) {
      App.contracts.PrivateSale = TruffleContract(data);
      App.contracts.PrivateSale.setProvider(App.web3Provider);
    });

    $.getJSON('FidelityHousePresale.json', function (data) {
      App.contracts.Presale = TruffleContract(data);
      App.contracts.Presale.setProvider(App.web3Provider);
    });

    $.getJSON('FidelityHouseICO.json', function (data) {
      App.contracts.ICO = TruffleContract(data);
      App.contracts.ICO.setProvider(App.web3Provider);
    });

    $.getJSON('FidelityHouseBounty.json', function (data) {
      App.contracts.Bounty = TruffleContract(data);
      App.contracts.Bounty.setProvider(App.web3Provider);
    });

    $.getJSON('FidelityHouseVendor.json', function (data) {
      App.contracts.Vendor = TruffleContract(data);
      App.contracts.Vendor.setProvider(App.web3Provider);
    });

    $.getJSON('FidelityHouseTimelock.json', function (data) {
      App.contracts.Timelock = TruffleContract(data);
      App.contracts.Timelock.setProvider(App.web3Provider);
    });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
