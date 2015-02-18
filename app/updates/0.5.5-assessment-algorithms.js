"use strict";
var keystone = require( 'keystone' );
var Assessment = keystone.list( 'Assessment' );
exports = module.exports = function( done ){
  Assessment.model.update( {}, { algorithm : "comparative-selection" }, { multi: true }, function( err ){
    if( err ){
      return done( err );
    }

    return done();
  } );
};
