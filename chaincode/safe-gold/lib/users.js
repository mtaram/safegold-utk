'use strict';

const query = require('./query.js');
const ledger = require('./ledger.js');
const utils = require('./utils.js');
const globals = require('./globals.js');

async function createNewUser(ctx, data) {
  if (!data.user_id) {
    throw new Error('User ID of customer is missing');
  };
  let user = await ledger.getStateByKey(ctx, data.user_id);
  if (user === 'NO_RECORD') {
    let type = globals.ASSET_TYPE;
    user = {
      country: data.country ? data.country : 'IN',
      user_id: data.user_id,
      name: data.name,
      mobile_no: data.mobile_no,
      email: data.email,
      pin_code: data.pin_code,
      gold_balance: 0,
      distributor_id: data.distributor_id,
      distributor_name: data.distributor_name,
      kyc_requirement: {
        identity_required: data.kyc_requirement.identity_required,
        pan_required: data.kyc_requirement.pan_required
      }
    };
    user[type] = globals.SAFE_GOLD_USER;
    await ledger.writeToDb(ctx, data.user_id, user);
    return {
      success: true,
      message: 'New user was registered successfuly',
      key: data.user_id,
      user: user
    };

  }
  else {
    return {
      success: true,
      message: 'User is already registered',
      user: user
    };
  };
};

async function decreaseUserBalance(ctx, data) {
  if (!utils.isNumber(data.gold_amount)) {
    throw new Error('Gold amount must be a valid number');
  };
  let user = await ledger.getStateByKey(ctx, data.user_id);
  let gold_amount = parseFloat(data.gold_amount);
  gold_amount = gold_amount > 0 ? gold_amount : -1 * gold_amount;
  if (gold_amount > user.gold_balance) {
    throw new Error('User has insufficient gold balance');
  };
  user.gold_balance -= gold_amount;
  await ledger.writeToDb(ctx, data.user_id, user);
  return {
    success: true,
    user: user
  };
};

async function increaseUserBalance(ctx, data) {
  if (!utils.isNumber(data.gold_amount)) {
    throw new Error('Entered value is not a valid number!');
  };
  let user = await ledger.getStateByKey(ctx, data.user_id);
  let gold_amount = parseFloat(data.gold_amount);
  gold_amount = gold_amount > 0 ? gold_amount : -1 * gold_amount;
  user.gold_balance += gold_amount;
  await ledger.writeToDb(ctx, data.user_id, user);
  return {
    success: true,
    user: user
  };
};

async function changeKycRequirement(ctx, data) {
  let user = await ledger.getStateByKey(ctx, data.user_id);

  let kyc_requirement = data.kyc_requirement;
  if (kyc_requirement.hasOwnProperty('identity_required')) {
    user.kyc_requirement.identity_required = kyc_requirement.identity_required;
  };
  if (kyc_requirement.hasOwnProperty('pan_required')) {
    user.kyc_requirement.pan_required = kyc_requirement.pan_required;
  };
  let res = await ledger.writeToDb(ctx, data.user_id, user);
  return {
    success: true,
    user: user
  };
};

async function changeMobileNumber(ctx, data) {
  let user = await ledger.getStateByKey(ctx, data.user_id);
  user.mobile_no = data.mobile_no
  await ledger.writeToDb(ctx, data.user_id, user);
  return {
    success: true,
    user: user
  };
};

module.exports = {
  createNewUser,
  decreaseUserBalance,
  increaseUserBalance,
  changeKycRequirement,
  changeMobileNumber
};
