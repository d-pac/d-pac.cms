"use strict";
var debug = require( "debug" )( "dpac:api.helpers.Controller" );

var _ = require( "underscore" );
var errors = require( "errors" );
var utils = require( "./utils" );

function Controller( service ){
  this.service = service;
}

_.extend( Controller.prototype, {

  retrieve : function( opts ){
    debug( "#retrieve" );
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
    debug( "#create" );
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
   */
  update : function( req ){
    debug( "#update" );
    var opts = {
      values : {
        _id : req.param( "_id" )
      },
      fields : this.service.editableFields
    };
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

  list : function( req ){
    var filter = req.param( "filter" );
    if( _.isString( filter ) ){
      filter = JSON.parse( filter );
    }
    return this.service
      .list( filter )
      .then( function( result ){
        if( !result ){
          result = [];
        }
        return result;
      } );
  },

  remove : function( req ){
    debug( "#remove" );
    return this.service.remove( {
      _id : req.param( "_id" )
    } )
      .then( function( result ){
        if( !result ){
          throw new errors.Http404Error();
        }
        return result;
      } );
  }
} );

module.exports = Controller;
