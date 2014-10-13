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

  /**
   *
   * @param opts
   * @param opts.fields [Required] Array of field names that will be updated, all other values
   *  will be ignored [!] for security reasons
   * @param opts.values [Optional] Object containing key value pairs that correspond to schema fields,
   *  if none supplied req.param will be used on `opts.fields` to populate the `values` object
   * @param req
   * @param res
   * @param next
   */
  create : function( opts,
                     req,
                     res,
                     next ){
    var values = utils.parseValues( opts, req );
    this.service
      .create( values )
      .onResolve( function( err,
                            result ){
        if( err ){
          return next( err );
        }
        if( !result ){
          return next( new errors.Http500Error() );
        }
        res.apiResponse( result );
      } );
  },

  /**
   *
   * @param opts
   * @param opts.fields [Required] Array of field names that will be updated, all other values
   *  will be ignored [!] for security reasons
   * @param opts.values [Optional] Object containing key value pairs that correspond to schema fields,
   *  if none supplied req.param will be used on `opts.fields` to populate the `values` object
   * @param req
   * @param res
   * @param next
   */
  update : function( opts,
                     req,
                     res,
                     next ){
    if( !opts.values ){
      opts.values = {};
    }
    _.defaults( opts.values, {
      _id : req.param( "_id" )
    } );
    var values = utils.parseValues( opts, req );
    this.service
      .update( values )
      .onResolve( function( err,
                            result ){
        if( err ){
          return next( err );
        }
        if( !result ){
          return next( new errors.Http500Error() );
        }
        res.apiResponse( result );
      } );
  },

  list : function( opts,
                   req,
                   res,
                   next ){
    this.service
      .list( opts )
      .onResolve( function( err,
                            result ){
        if( err ){
          return next( err );
        }
        if( !result ){
          result = [];
        }
        res.apiResponse( result );
      } );
  }
} );

module.exports = Controller;
