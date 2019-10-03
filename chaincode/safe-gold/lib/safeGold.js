'use strict';

const { Contract } = require('fabric-contract-api');
const utils = require('./utils.js');
const users = require('./users.js');
const errorHandler = require('./error-handler.js');
const query = require('./query.js');
const ledger = require('./ledger.js');
const vault = require('./vault.js');
const globals = require('./globals.js');

class SafeGold extends Contract {

  async instantiate(ctx) {
    console.log('###### Instantiate Called ######');
    // TODO: Make this composite key?
    let distributors = await ledger.getStateByKey(ctx, globals.DISTRIBUTOR_LIST);
    if (distributors === 'NO_RECORD') {
      let distributorArr = [ 'payTM', 'HDFC', 'ICICI'];
      // let payload = {
      //   name: 'payTM',
      //   distributor_id: 'DB_122',
      //   onboarding_date: '18:05:24:00Z'
      // };
      await ledger.writeToDb(ctx, globals.DISTRIBUTOR_LIST, distributorArr);

    } else {
      console.log('Distributors list already exists');
    };

    let vault = await ledger.getStateByKey(ctx, globals.VAULT);
    if (vault === 'NO_RECORD') {
      let newVault = {
        gold_amount: 0,
        custodian: 'IDBI',
        name: 'Custodian Vault',
        createdAt: utils.getTimeInMillis(ctx),
        lastUpdatedAt: utils.getTimeInMillis(ctx)
      };
      await ledger.writeToDb(ctx, globals.VAULT, newVault);
    } else {
      console.log('Vault already exists');
    };

    let sgBalance = await ledger.getStateByKey(ctx, globals.SAFE_GOLD_BALANCE);
    if (sgBalance === 'NO_RECORD') {
      let newSgBalance = {
        gold_amount: 0,
        custodian: 'IDBI',
        name: 'SafeGold',
        createdAt: utils.getTimeInMillis(ctx),
        lastUpdatedAt: utils.getTimeInMillis(ctx)
      };
      await ledger.writeToDb(ctx, globals.SAFE_GOLD_BALANCE, newSgBalance);
    } else {
      console.log('Safe Gold balance already exists');
    };
    return true;
  };

  async beforeTransaction(ctx) {
    console.info(`\n--- Function ${utils.getTxName(ctx)} with ID: ${utils.getTxID(ctx)} called ---`);
  };

  // Distributor functions
  async modifyDistributorList(ctx, data) {
    data = JSON.parse(data);
    let distributorArr = await ledger.getStateByKey(ctx, globals.DISTRIBUTOR_LIST);
    distributorArr.push(data.distributor_id);
    await ledger.writeToDb(ctx, globals.DISTRIBUTOR_LIST, distributorArr);
    return JSON.stringify({ success: true, distributors: distributorArr });
  };

  async queryAllUsersByDistributor(ctx, data) {
    data = JSON.parse(data);
    let queryString = {
      "selector": {
        "distributor_id": data.distributor_id
      }
    };
    let results = await query.getRichQuery(ctx, JSON.stringify(queryString));
    return JSON.stringify({ success: true, users: results });
  };


  /*********** User basic functions ************/
  async registerNewUser(ctx, data) {
    data = JSON.parse(data);
    let result = await users.createNewUser(ctx, data);
    return JSON.stringify(result);
  };

  async changeKycRequirement(ctx, data) {
    data = JSON.parse(data);
    await utils.getUserIfExists(ctx, data.user_id);
    let result = await users.changeKycRequirement(ctx, data);
    return JSON.stringify(result);
  };

  async changeMobileNumber(ctx, data){
    data = JSON.parse(data);
    await utils.getUserIfExists(ctx, data.user_id);
    let result = await users.changeMobileNumber(ctx, data);
    return JSON.stringify(result);
  };

  async queryUser(ctx, data) {
    data = JSON.parse(data);
    let user = await utils.getUserIfExists(ctx, data.user_id);
    return { success: true, user: user };
  };

  // Add pagination
  async queryAllUsers(ctx, data) {
    let type = globals.ASSET_TYPE;
    let queryString = { selector: {}  };
    queryString.selector[type] = globals.SAFE_GOLD_USER;
    let results = await query.getRichQuery(ctx, JSON.stringify(queryString));
    return JSON.stringify({ success: true, users: results });
  };

// TODO: Check for distributor mismatch?
  async buyGold(ctx, data) {
    data = JSON.parse(data);
    await utils.getUserIfExists(ctx, data.user_id);
    await vault.decreaseSafeGoldBalance(ctx, { tx_id: data.tx_id, gold_amount: data.gold_amount});
    let result = await users.increaseUserBalance(ctx, data);
    let txKey = ctx.stub.createCompositeKey(globals.GOLD_TX, [globals.BUY_GOLD, utils.getTxID(ctx)]);
    let buyTx = {
      distributor_id: data.distributor_id,
      mobile_no: data.mobile_no,
      tx_id: data.tx_id,
      gold_amount: data.gold_amount,
      invoice_id: data.invoice_id,
      user_id: data.user_id,
      rate_id: data.rate_id,
      sg_rate: data.sg_rate,
      buy_price: data.buy_price,
      type: 'BUY_GOLD',
      success: 'successful'
    };
    await ledger.writeToDb(ctx, txKey, buyTx);
    return JSON.stringify(result);
  };

  async sellGold(ctx, data) {
    data = JSON.parse(data);
    await utils.getUserIfExists(ctx, data.user_id);
    await vault.increaseSafeGoldBalance(ctx, data);
    let sellResult = await users.decreaseUserBalance(ctx, data);
    let txKey = ctx.stub.createCompositeKey(globals.GOLD_TX, [globals.SELL_GOLD, utils.getTxID(ctx)]);
    let sellTx = {
      distributor_id: data.distributor_id,
      mobile_no: data.mobile_no,
      tx_id: data.tx_id,
      gold_amount: data.gold_amount,
      invoice_id: data.invoice_id,
      user_id: data.user_id,
      rate_id: data.rate_id,
      sg_rate: data.sg_rate,
      sell_price: data.sell_price,
      type: 'SELL_GOLD',
      success: 'successful'
    };
    await ledger.writeToDb(ctx, txKey, sellTx);
    return JSON.stringify(sellResult);
  };

  async giftGold(ctx, data) {
    data = JSON.parse(data);
    if (data.sender_id === data.receiver_id) {
      throw new Error('Sender and receiver must be different users');
    };
    let sender = await utils.getUserIfExists(ctx, data.sender_id);
    let receiver = await utils.getUserIfExists(ctx, data.receiver_id);

    let senderResult = await users.decreaseUserBalance(ctx, {
      user_id: data.sender_id,
      gold_amount: data.gold_amount
    });
    let receiverResult = await users.increaseUserBalance(ctx, {
      user_id: data.receiver_id,
      gold_amount: data.gold_amount
    });
    let txKey = ctx.stub.createCompositeKey(globals.GOLD_TX, [globals.GIFT_GOLD, utils.getTxID(ctx)]);
    await ledger.writeToDb(ctx, txKey, data);
    return JSON.stringify({ success: true });
  };

  // reduce c1 balance
  // reduce total inventory (use composite keys?)
  async redeemGold(ctx, data) {
    data = JSON.parse(data);
  };



  async genericQuery(ctx, data) {
    data = JSON.parse(data);
    let results = await query.getRichQuery(ctx, data.query);
    return JSON.stringify({ success: true, data: results });
  };

  async getVault(ctx, data) {
    let vault = await ledger.getStateByKey(ctx, globals.VAULT);
    return JSON.stringify({ success: true, vault: vault });
  };

  async getSafeGoldBalance(ctx, data) {
    let sgBalance = await ledger.getStateByKey(ctx, globals.SAFE_GOLD_BALANCE);
    return JSON.stringify(sgBalance);
  };

  async getPendingBalanceChanges(ctx, data) {
    let iterator = await ctx.stub.getStateByPartialCompositeKey(globals.SAFE_GOLD_BALANCE, [globals.BALANCE_CHANGE]);
    let results = await query.resolveIterator(iterator);
    return JSON.stringify({ success: true, data: results });
  };

  //TODO: Make pruneSafe()
  // Implement pagination, push to arr, then add
  async tallySafeGoldBalance(ctx, data) {
    let result = await vault.tallySafeGoldBalance(ctx, data);
    return JSON.stringify(result);
  };


  /********** Custodian/ Vault functions ********/
  async initiateProposal(ctx, data) {
    data = JSON.parse(data);
    let result = await vault.initiateProposal(ctx, data);
    return JSON.stringify(result);
  };

  async trusteeApproval(ctx, data) {
    data = JSON.parse(data);
    let result = await vault.trusteeApproval(ctx, data);
    return JSON.stringify(result);
  };

  async custodianConfirmsDelivery(ctx, data) {
    data = JSON.parse(data);
    let result = await vault.custodianConfirmsDelivery(ctx, data);
    return JSON.stringify(result);
  };

};

module.exports = SafeGold;
