'use strict';

function createError(message) {
  let payload = {
    success: false,
    error_message: message
  };
  return JSON.stringify(payload)
};

module.exports = { createError };
