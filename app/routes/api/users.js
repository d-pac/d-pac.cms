"use strict";
var debug = require( "debug" )( "dpac:api.users" );
var keystone = require( "keystone" );
var _ = require( "underscore" );
var errors = require( "errors" );
var Controller = require( "./Controller" );
var utils = require( "./utils" );
var service = require( "../../services/users" );
var schema = keystone.list( "User" );

var controller = new Controller( service, schema );

exports.retrieve = function( req,
                             res,
                             next ){
  debug( "#retrieve" );
  controller.retrieve( {
    _id : req.user.id
  }, req, res, next );
};

var update = module.exports.update = function( req,
                                               res,
                                               next ){
  debug( "#update" );
  var fields = schema.api.editable;
  var values = utils.parseValues( {
    // the `getUpdateHandler` needs only the names of the fields, really in the model
    // BUT it does need a `password_confirm` member in the data object
    fields : [ "password_confirm" ].concat( fields )
  }, req );

  service
    .retrieve( {
      _id : req.user.id
    } )
    .then( function( user ){
      // we need to use this atrocity since otherwise the keystone-native validators won't run
      user.getUpdateHandler( req, res ).process( values, {
        fields      : fields,
        flashErrors : false
      }, function( err,
                   processor ){
        if( err ){
          return next( err );
        }
        var user = processor.item;

        if( !user ){
          return next( new errors.Http500Error() );
        }

        return res.apiResponse( user );
      } );
    } );
};

module.exports.replace = function( req,
                                   res,
                                   next ){
  debug( "#replace" );
  update( req, res, next );
};
