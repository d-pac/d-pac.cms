var keystone = require( 'keystone' );
var async = require( 'async' );
var constants = require( "../models/helpers/constants" );
var Assessment = keystone.list( 'Assessment' );

exports = module.exports = function( done ){
  Assessment.model.update( {}, { enableTimeLogging : true }, { multi : true }, function( err,
                                                                                         numAffected,
                                                                                         raw ){
    if( err ){
      console.log( err );
      return done( err );
    }
    console.log( "Updated", numAffected, " assessments" );
    done();
  } );
};
