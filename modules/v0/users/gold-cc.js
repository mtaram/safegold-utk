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

const buyGold = async (req, res, next) => {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');
  const payload = {
    user_id: req.body.user_id,
    gold_amount: req.body.gold_amount,
    tx_id: req.body.tx_id
  };
  try {
    const ccRres = await contract.submitTransaction('buyGold', JSON.stringify(payload));
    let response = JSON.parse(ccRres.toString())
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

const sellGold = async (req, res, next) => {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');

  try {
    const payload = {
      user_id: req.body.user_id,
      gold_amount: req.body.gold_amount,
      tx_id: req.body.tx_id
    };
    const ccRes = await contract.submitTransaction('sellGold', JSON.stringify(payload));
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

const giftGold = async (req, res, next) => {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');
  try {
    const payload = {
      sender_id: req.body.sender_id,
      receiver_id: req.body.receiver_id,
      gold_amount: req.body.gold_amount,
      tx_id: req.body.tx_id
    };
    const ccRes = await contract.submitTransaction('giftGold', JSON.stringify(payload));
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

const redeemGold = async (req, res, next) => {

};

module.exports = {
  buyGold,
  sellGold,
  giftGold
};
