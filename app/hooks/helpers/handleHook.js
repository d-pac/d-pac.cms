'use strict';
const {
  isFunction
} = require('lodash');

module.exports = function handleHook(handler) {
  if (typeof handler !== 'function') {
    throw new TypeError('Handler of type "Function" expected.');
  }
  return function (mixed) {
    let done, arg;
    if (mixed) {
      if (typeof mixed === 'function') {
        done = mixed;
        arg = this; //eslint-disable-line no-invalid-this
      } else {
        arg = mixed;
      }
    }
    const result = handler(arg);
    if (result && isFunction(result) && result.then) {
      result.asCallback(done);
    }else{
      done();
    }
  };
};
