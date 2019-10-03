'use strict';

const globals = require('./globals.js');
const ledger = require('./ledger.js');
const utils = require('./utils.js');
const query = require('./query.js');

async function decreaseSafeGoldBalance(ctx, data) {
  if (!utils.isNumber(data.gold_amount)) {
    throw new Error('Entered value is not a valid number!');
  };
  let key = ctx.stub.createCompositeKey(globals.SAFE_GOLD_BALANCE, [globals.BALANCE_CHANGE, utils.getTxID(ctx)]);
  let gold_amount = parseFloat(data.gold_amount);
  gold_amount = gold_amount < 0 ? gold_amount : -1 * gold_amount;
  let change = {
    timestamp: utils.getTimeInMillis(ctx),
    gold_amount: gold_amount,
    tx_id: data.tx_id,
    type: 'DECREASE_SG_BALANCE'
    // TODO: new data based on feedback from Parmesh
  };
  await ledger.writeToDb(ctx, key, change);
  return { success: true, gold_amount: change };
};

async function increaseSafeGoldBalance(ctx, data) {
  if (!utils.isNumber(data.gold_amount)) {
    throw new Error('Entered value is not a valid number!');
  };
  let key = ctx.stub.createCompositeKey(globals.SAFE_GOLD_BALANCE, [globals.BALANCE_CHANGE, utils.getTxID(ctx)]);
  let gold_amount = parseFloat(data.gold_amount);
  gold_amount = gold_amount > 0 ? gold_amount : -1 * gold_amount;
  let change = {
    timestamp: utils.getTimeInMillis(ctx),
    gold_amount: gold_amount,
    tx_id: data.tx_id,
    type: 'INCREASE_SG_BALANCE'
  };
  await ledger.writeToDb(ctx, key, change);
  return { success: true, gold_amount: change };
};

async function tallySafeGoldBalance(ctx, data) {
  let dataKeyArr = [];
  let sgBalance = await ledger.getStateByKey(ctx, globals.SAFE_GOLD_BALANCE);
  let iterator = await ctx.stub.getStateByPartialCompositeKey(globals.SAFE_GOLD_BALANCE, [globals.BALANCE_CHANGE]);
  let results = await query.resolveIterator(iterator);
  // [ { Key: 1234, data: {gold_amount:-2, timestamp: 1234321 }} ]
  let gold_amount = sgBalance.gold_amount;
  let tempKey = `${globals.TEMP_STORAGE}:${utils.getTxID(ctx)}`;
  await ledger.writeToDb(ctx, tempKey, { temp_balance: sgBalance.gold_amount, timestamp: utils.getTimeInMillis(ctx) });
  console.log('\n#####Current gold_amount is ' + gold_amount);

  for (var i = 0; i < results.length; i++) {
    gold_amount += results[i].data.gold_amount;
    console.log('Adding gold_amount delta ' + results[i].data.gold_amount);
    dataKeyArr.push(results[i].key);
  };
  console.log('New gold_amount should be ' + gold_amount);

  if (!utils.isNumber(gold_amount)) {
    throw new Error (`Error in adding gold_amount, new gold_amount is ${gold_amount}`);

  } else {
    sgBalance.gold_amount = parseFloat(gold_amount);
    sgBalance.lastUpdatedAt = utils.getTimeInMillis(ctx);
    await ledger.writeToDb(ctx, globals.SAFE_GOLD_BALANCE, sgBalance);
    for (var i = 0; i < dataKeyArr.length; i++) {
      await ledger.deleteStateByKey(ctx, dataKeyArr[i]);
      // TODO: Add tx to RETIRED_TX key?
    };
    return { success: true, sgBalance: sgBalance };
  };
};

async function removeGoldFromVault() {

};

async function addGoldToVault() {

};

async function initiateProposal(ctx, data) {
  let proposal = await ledger.getStateByKey(ctx, data.tx_id);
  if (proposal !== 'NO_RECORD') {
    throw new Error(`Proposal with ID ${data.tx_id} already exists. Did you mean to vote on it?`);
  }
  let payload = {
    product_name: data.product_name,
    product_desc: data.product_desc,
    gold_amount: data.gold_amount,
    purchase_rate: data.purchase_rate,
    purity: data.purity ? data.purity : 0.995,
    status: 'PENDING_APPROVAL'
  };
  await ledger.writeToDb(ctx, data.tx_id, payload);
  return { success: true, message: 'Proposal has been created', proposal: payload };
};

async function trusteeApproval(ctx, data) {
  let proposal = await ledger.getStateByKey(ctx, data.tx_id);
  if (proposal === 'NO_RECORD') {
    throw new Error(`Proposal with ID ${data.tx_id} does not exist`);

  } else if (proposal.status !== 'PENDING_APPROVAL') {
    throw new Error('Proposal status must be PENDING_APPROVAL');
  };
  proposal.status = 'APPROVED_BY_TRUSTEE';
  await ledger.writeToDb(ctx, data.tx_id, proposal);
  return { success: true, mesage: 'Trustee has approved the proposal', proposal: proposal };
};

async function custodianConfirmsDelivery(ctx, data) {
  let proposal = await ledger.getStateByKey(ctx, data.tx_id);
  if (proposal === 'NO_RECORD') {
    throw new Error(`Proposal with ID ${data.tx_id} does not exist`);

  } else if (proposal.status !== 'APPROVED_BY_TRUSTEE') {
    throw new Error('Proposal status must be APPROVED_BY_TRUSTEE');
  };
  proposal.status = 'DELIVERY_COMPLETED';
  await ledger.writeToDb(ctx, data.tx_id, proposal);

  let vault = await ledger.getStateByKey(ctx, globals.VAULT);
  vault.gold_amount += proposal.gold_amount;
  await ledger.writeToDb(ctx, globals.VAULT, vault);
  await increaseSafeGoldBalance(ctx, { gold_amount: proposal.gold_amount });
  return { success: true, mesage: 'Delivery has been confirmed. Gold balance auto incremented.' };
};


module.exports = {
  increaseSafeGoldBalance,
  decreaseSafeGoldBalance,
  tallySafeGoldBalance,
  initiateProposal,
  trusteeApproval,
  custodianConfirmsDelivery
};
