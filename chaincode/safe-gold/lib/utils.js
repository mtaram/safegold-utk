'use strict';

const ledger = require('./ledger.js');

function getInvoker(ctx) {
  const cid = ctx.clientIdentity;
   // X509 Certificate invoker is in CN form
  const id = cid.getID();
  return id;
};

function getTxID(ctx) {
  return ctx.stub.getTxID();
};

function getTxName(ctx) {
  const ret = ctx.stub.getFunctionAndParameters();
  return ret.fcn;
};

function getTimeInMillis(ctx) {
  return ctx.stub.getTxTimestamp().getSeconds()*1000;
};

function getTxDate(ctx) {
  return new Date(ctx.stub.getTxTimestamp().getSeconds() * 1000);
};

function checkExpectedParams(data, propertyList) {
  let missingArr = [];
    for (var i = 0; i < propertyList.length; i++) {
      if (!data.hasOwnProperty(propertyList[i])) {
        missingArr.push(propertyList[i]);
      };
    };
    if (missingArr && missingArr.length > 0) {
      return { valid: true, missingArr: [] };

    } else {
      return { valid: false, missingArr: missingArr };
    };
};

// Data cannot be null/ undefined
function toBuffer(data) {
  let isJSON = checkJSON(data);
  let bufferData;
  if (isJSON) {
    bufferData = Buffer.from(JSON.stringify(data));

  } else {
    bufferData = Buffer.from(data.toString());
  };
  return bufferData;
};

function checkJSON(data) {
  if (data !== null && typeof(data) !== 'undefined') {
    try {
      JSON.parse(data);
      return true;

    } catch (e) {
      console.log('NOT JSON or VALID JSON');
      return false;
    };
  } else {
    return false;
  };
};

function isNumber(data) {
  console.log('Testing for number ' + data + ' ' + typeof(data));
  if (typeof(data) === 'string') {
    data = data.trim();
  };
  // TODO: Should we do { success: true, number: parseFloat(data) } with (try - catch)
  return /^\-?[0-9]+(e[0-9]+)?(\.[0-9]+)?$/.test(data);
};

function removeFromArr(arr, value) {
  let index;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].indexOf(value) !== -1) {
      index = i;
      break;
    };
  };
  arr.splice(index, 1);
};

async function getUserIfExists(ctx, key) {
  let user = await ledger.getStateByKey(ctx, key);
  if (user === 'NO_RECORD') {
    throw new Error(`User with ID ${key} does not exist`);

  } else {
    return user;
  };
};

module.exports = {
  getTxID,
  getInvoker,
  getTxName,
  getTimeInMillis,
  getTxDate,
  checkExpectedParams,
  toBuffer,
  checkJSON,
  isNumber,
  getUserIfExists
};
