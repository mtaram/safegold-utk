'use strict';

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const utils = require('./utils.js');
const ccpPath = path.resolve(__dirname, '../', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const walletPath = '../wallet';
const wallet = new FileSystemWallet(walletPath);

async function addBalance() {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');
  const payload = {
    gold_amount: '1.12'
  };
  try {
    const res = await contract.submitTransaction('addGoldToVault', JSON.stringify(payload));
    console.log(res.toString());

  } catch (e) {
    utils.parseError(e);

  } finally {
    await gateway.disconnect();
  };
};

async function getBalance() {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');
  const payload = { };
  try {
    const res = await contract.evaluateTransaction('getVault', JSON.stringify(payload));
    try {
      let response = JSON.parse(res.toString())
      console.log(JSON.stringify(response, null, 4));
    } catch (e) {
      console.log(res.toString());
    };

  } catch (e) {
    utils.parseError(e);

  } finally {
    await gateway.disconnect();
  };
};

async function getBalanceDeltas() {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');
  const payload = { };
  try {
    const res = await contract.evaluateTransaction('getPendingBalanceChanges', JSON.stringify(payload));
    try {
      let response = JSON.parse(res.toString())
      console.log(JSON.stringify(response, null, 4));
    } catch (e) {
      console.log(res.toString());
    };

  } catch (e) {
    utils.parseError(e);

  } finally {
    await gateway.disconnect();
  };
};

async function tallySafeGoldBalance() {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');
  const payload = {
    gold_amount: -2
  };
  try {
    const res = await contract.submitTransaction('tallySafeGoldBalance', JSON.stringify(payload));
    let response = JSON.parse(res.toString())
    console.log(JSON.stringify(response, null, 4));

  } catch (e) {
    utils.parseError(e);

  } finally {
    await gateway.disconnect();
  };
};

getBalance();
// addBalance();
getBalanceDeltas();
// tallySafeGoldBalance();
