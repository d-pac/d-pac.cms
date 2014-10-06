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
      .retrieve( opts.values )
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

  create : function( opts,
                     req,
                     res,
                     next ){
    var values = utils.parseValues( opts, req );
    this.service.create( values ).onResolve( function( err,
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

  update : function( opts,
                     req,
                     res,
                     next ){
    if(! opts.values){
      opts.values = {};
    }
    _.defaults( opts.values, {
      _id : req.param( "_id" )
    } );
    console.log(opts);
    var values = utils.parseValues( opts, req );
    this.service.update( values ).onResolve( function( err,
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
