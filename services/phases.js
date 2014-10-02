'use strict';

var _ = require('underscore');
var keystone = require( 'keystone' );
var Phase = keystone.list( 'Phase' );

module.exports.retrieve = function retrievePhases( opts ){
  //debug('retrievePhases');
  return Phase.model
    .find()
    .where( '_id' ).in( opts.ids )
    .lean()
    .exec();
};
