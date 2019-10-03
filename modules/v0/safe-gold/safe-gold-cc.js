'use strict';

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const misc = require('../../../utils/misc.js');

const ccpPath = path.resolve(__dirname, '../../../', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const walletPath = path.join(process.cwd(), 'wallet');
const wallet = new FileSystemWallet(walletPath);

const tallySafeGoldBalance = async (req, res, next) => {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');

  try {
    const payload = { };
    const ccRes = await contract.submitTransaction('tallySafeGoldBalance', JSON.stringify(payload));
    let response = JSON.parse(ccRes.toString())
    console.log(JSON.stringify(response, null, 4));
    await gateway.disconnect();
    res.json(response);

  } catch (e) {
    console.log('throw here');
    await gateway.disconnect();
    let msg = misc.parseError(e);
    next(new Error(JSON.stringify({ mesage: msg })));
  };
};

const getSafeGoldBalance = async (req, res, next) => {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');

  try {
    const payload = { };
    const deltaRes = await contract.evaluateTransaction('getPendingBalanceChanges', JSON.stringify(payload));
    const sgRes = await contract.evaluateTransaction('getSafeGoldBalance', JSON.stringify(payload));
    let deltas = JSON.parse(deltaRes.toString());
    let sg = JSON.parse(sgRes.toString());
    // console.log(JSON.stringify(response, null, 4));
    await gateway.disconnect();
    res.json({ safe_gold: sg, pending_balance_changes: deltas });

  } catch (e) {
    console.log('throw here');
    await gateway.disconnect();
    let msg = misc.parseError(e);
    next(new Error(JSON.stringify({ mesage: msg })));
  };
};

const getTotalVaultBalance = async (req, res, next) => {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');
  try {
    let payload = { };
    console.log(payload);
    const response = await contract.evaluateTransaction('getVault', JSON.stringify(payload));
    await gateway.disconnect();
    res.json(JSON.parse(response.toString()));

  } catch (e) {
    console.log('throw here');
    await gateway.disconnect();
    let msg = misc.parseError(e);
    next(new Error(JSON.stringify({ mesage: msg })));
  };
};

const initiateProposal = async (req, res, next) => {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');
  try {
    let payload = {
      tx_id: req.body.tx_id,
      product_name: req.body.product_name,
      product_desc: req.body.product_desc,
      gold_amount: req.body.gold_amount,
      purchase_rate: req.body.purchase_rate,
      purity: req.body.purity ? req.body.purity : 0.995
    };
    const ccRes = await contract.submitTransaction('initiateProposal', JSON.stringify(payload));
    let response = JSON.parse(ccRes.toString())
    console.log(JSON.stringify(response, null, 4));
    await gateway.disconnect();
    res.json(response);

  } catch (e) {
    console.log('throw here');
    await gateway.disconnect();
    let msg = misc.parseError(e);
    next(new Error(JSON.stringify({ mesage: msg })));
  };
};


const trusteeApproval = async (req, res, next) => {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');
  try {
    let payload = {
      tx_id: req.body.tx_id
    };
    const ccRes = await contract.submitTransaction('trusteeApproval', JSON.stringify(payload));
    let response = JSON.parse(ccRes.toString())
    console.log(JSON.stringify(response, null, 4));
    await gateway.disconnect();
    res.json(response);

  } catch (e) {
    console.log('throw here');
    await gateway.disconnect();
    let msg = misc.parseError(e);
    next(new Error(JSON.stringify({ mesage: msg })));
  };
};

const custodianConfirmsDelivery = async (req, res, next) => {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');
  try {
    let payload = {
      tx_id: req.body.tx_id
    };
    const ccRes = await contract.submitTransaction('custodianConfirmsDelivery', JSON.stringify(payload));
    let response = JSON.parse(ccRes.toString())
    console.log(JSON.stringify(response, null, 4));
    await gateway.disconnect();
    res.json(response);

  } catch (e) {
    console.log('throw here');
    await gateway.disconnect();
    let msg = misc.parseError(e);
    next(new Error(JSON.stringify({ mesage: msg })));
  };
};

module.exports = {
  tallySafeGoldBalance,
  getSafeGoldBalance,
  getTotalVaultBalance,
  initiateProposal,
  trusteeApproval,
  custodianConfirmsDelivery
};
