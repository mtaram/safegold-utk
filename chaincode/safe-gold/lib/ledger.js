'use strict';

async function getStateByKey(ctx, key) {
  const data = await ctx.stub.getState(key);
  console.log('\nGetting State for %s', key);
  console.log(data.toString());
  if (!data.length || typeof(data) === 'undefined') {
    return 'NO_RECORD';

  } else {
    return JSON.parse(data.toString());
  };
};

async function deleteStateByKey(ctx, key) {
  const exists = await getStateByKey(ctx, key);
  if (exists === 'NO_RECORD') {
    return false;

  } else {
    console.log('Found key ' + key + ' deleting it now');
    await ctx.stub.deleteState(key);
    return true;
  };
};

async function writeToDb(ctx, key, payload) {
  console.log('\nWriting with key ' + key);
  await ctx.stub.putState(key, Buffer.from(JSON.stringify(payload)));
  return true;
};


module.exports = {
  getStateByKey,
  deleteStateByKey,
  writeToDb
};
