'use strict';
var _ = require('underscore');

module.exports.hasKeys = function(scrutinized, keys){
  return _.intersection(_.keys(scrutinized), keys ).length === keys.length;
};
