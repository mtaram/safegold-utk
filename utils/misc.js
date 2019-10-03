'use strict';

const parseError = (e) => {
  console.log('Reaching error handler');
  console.log('\n');
  let splitError = e.message.split(' ');
  var index;
  for (var i = splitError.length - 1; i >= 0; i--) {
    if (splitError[i].indexOf('Error:') !== -1) {
      index = i;
      // No break since Error is used multiple times
    };
  };
  splitError.splice(0, index + 1);
  let finalError = '';
  for (var i = 0; i < splitError.length; i++) {
    finalError += `${splitError[i]} `;
  };
  // console.log(JSON.parse(finalError));
  console.log('####'+finalError);
  return finalError;
};

module.exports = {
  parseError
};
