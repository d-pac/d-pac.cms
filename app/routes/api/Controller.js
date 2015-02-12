"use strict";

var _ = require( "underscore" );
var errors = require( "errors" );
var utils = require( "./utils" );

function Controller( service,
                     schema ){
  this.service = service;
  this.schema = schema;
}

_.extend( Controller.prototype, {

  retrieve : function( opts ){
    return this.service
      .retrieve( opts )
      .then( function( result ){
        if( !result ){
          throw new errors.Http404Error();
        }
        return result;
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
   */
  create : function( opts,
                     req ){
    var values = utils.parseValues( opts, req );
    return this.service
      .create( values )
      .then( function( result ){
        if( !result ){
          throw new errors.Http500Error();
        }
        return result;
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
                     req ){
    if( !opts.values ){
      opts.values = {};
    }
    _.defaults( opts.values, {
      _id : req.param( "_id" )
    } );
    var values = utils.parseValues( opts, req );
    return this.service
      .update( values )
      .then( function( result ){
        if( !result ){
          throw new errors.Http404Error();
        }
        return result;
      } );
  },

  list : function( opts ){
    return this.service
      .list( opts )
      .then( function( result ){
        if( !result ){
          result = [];
        }
        return result;
      } );
  }
} );

module.exports = Controller;
