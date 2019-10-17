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

const registerNewUser = async (req, res, next) => {
  let gateway = new Gateway
  console.log(ccp);
  await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');
  try {
    let identity_required;
    let pan_required;
    if (req.body.kyc_requirement.hasOwnProperty('identity_required')) {
      identity_required = req.body.kyc_requirement.identity_required;
    } else {
      identity_required = 0;
    };
    if (req.body.kyc_requirement.hasOwnProperty('pan_required')) {
      pan_required = req.body.kyc_requirement.pan_required;
    } else {
      pan_required = 0;
    };
    const payload = {
      user_id: req.body.user_id,
      mobile_no: req.body.mobile_no,
      name: req.body.name,
      distributor_name: req.body.distributor_name,
      distributor_id: req.body.distributor_id,
      email: req.body.email,
      pin_code: req.body.pin_code,
      kyc_requirement: {
        identity_required: identity_required,
        pan_required: pan_required
      }
    };
    const ccRes = await contract.submitTransaction('registerNewUser', JSON.stringify(payload));
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

const updateUserKyc = async (req, res, next) => {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');

  try {
    const payload = {
      user_id: req.body.user_id,
      kyc_requirement: { }
    };
    if (req.body.kyc_requirement.hasOwnProperty('pan_required')) {
      payload.kyc_requirement.pan_required = req.body.kyc_requirement.pan_required;
    };
    if (req.body.kyc_requirement.hasOwnProperty('identity_required')) {
      payload.kyc_requirement.identity_required = req.body.kyc_requirement.identity_required;
    };
    const ccRes = await contract.submitTransaction('changeKycRequirement', JSON.stringify(payload));
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

const updateMobileNo = async (req, res, next) => {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');

  try {
    let payload = {
      user_id: req.body.user_id,
      mobile_no: req.body.mobile_no
    };
    const ccRes = await contract.submitTransaction('changeMobileNumber', JSON.stringify(payload));
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

const getUserByID = async (req, res, next) => {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');
  try {
    let payload = {
      user_id: req.params.id
    };
    console.log(payload);
    const response = await contract.evaluateTransaction('queryUser', JSON.stringify(payload));
    await gateway.disconnect();
    res.json(JSON.parse(response.toString()));

  } catch (e) {
    console.log('throw here');
    await gateway.disconnect();
    let msg = misc.parseError(e);
    next(new Error(JSON.stringify({ mesage: msg })));
  };
};

const getAllUsers = async (req, res, next) => {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');

  try {
    const payload = { };
    let response;
    if (req.query.hasOwnProperty('mobile_no')) {
      console.log('received query');
      const accounts = await contract.evaluateTransaction('queryUserAccounts', JSON.stringify({mobile_no: req.query.mobile_no}));
      response = JSON.parse(accounts.toString());

    } else {
      const users = await contract.evaluateTransaction('queryAllUsers', JSON.stringify(payload));
      response = JSON.parse(users.toString());
    };
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

const getUsersForDistributor = async (req, res, next) => {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');

  try {
    const payload = { distributor_id: req.params.distributor_id };
    const users = await contract.evaluateTransaction('queryAllUsersByDistributor', JSON.stringify(payload));
    let response = JSON.parse(users.toString());
    // console.log(JSON.stringify(response, null, 4));
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
  registerNewUser,
  updateUserKyc,
  updateMobileNo,
  getAllUsers,
  getUsersForDistributor,
  getUserByID
};
