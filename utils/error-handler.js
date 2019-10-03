'use strict';

// const logger = require('./logger.js');
// const statusCodes = require.cache.statusCodes;
// const internalCodes = require.cache.internalCodes;

const errorHandler = (err, req, res, next) => {
  console.log('------ ERROR HANDLER CALLED ---------');
  console.log(err.message);
  res.status(400).json(JSON.parse(err.message));
};

module.exports = errorHandler;
