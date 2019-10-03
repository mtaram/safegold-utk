'use strict';

const utils = require('./utils');

async function resolveIterator(iterator) {
  const allResults = [];
  while (true) {
    const res = await iterator.next();
    if (res.value && res.value.value.toString()) {

      const key = res.value.key;
      let data;
      try {
        data = JSON.parse(res.value.value.toString('utf8'));
      }
      catch (err) {
        console.log(err);
        data = res.value.value.toString('utf8');
      }
      allResults.push({
        key,
        data
      });
    }
    if (res.done) {
      await iterator.close();
      console.info(allResults);
      return allResults;
    };
  };
};

async function getRichQuery(ctx, queryString) {
  if (typeof queryString !== 'string' && utils.checkJSON(queryString)) {
    queryString = JSON.stringify(queryString);

  } else if (typeof queryString !== 'string' && !utils.checkJSON(queryString)) {
    throw new Error('Invalid queryString format received ' + queryString);
  };
  let iterator = await ctx.stub.getQueryResult(queryString);
  let results = await resolveIterator(iterator);
  return results;
};

module.exports = {
  resolveIterator,
  getRichQuery
};
