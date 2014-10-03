'use strict';

var _ = require( 'underscore' );
var errors = require( 'errors' );
var utils = require( './utils' );

function Controller( service,
                     schema ){
  this.service = service;
  this.schema = schema;
}

_.extend( Controller.prototype, {
  retrieve : function( opts,
                       req,
                       res,
                       next ){
    this.service
      .retrieve( opts )
      .onResolve( function( err,
                            result ){
        if( err ){
          return next( err );
        }
        if( !result ){
          return next( new errors.Http404Error() );
        }

        res.apiResponse( result );
      } );
  },

  update : function( opts,
                     req,
                     res,
                     next ){
    this.service.update( opts,
      utils.verifyChangesAllowed( opts, this.schema.api.editable )
    ).onResolve( function( err,
                           result ){
        if( err ){
          return next( err );
        }
        if( !result ){
          return next( new errors.Http500Error() );
        }
        res.apiResponse( result );
      } );
  }
} );

module.exports = Controller;
