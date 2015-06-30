"use strict";
var debug = require( "debug" )( "dpac:api.helpers.Controller" );

var _ = require( "lodash" );
var errors = require( "errors" );
var utils = require( "./utils" );

function Controller( service ){
  this.service = service;
}

_.extend( Controller.prototype, {
  mixin: function( receiver ){
    receiver = receiver || {};
    var controller = this;
    receiver.retrieve = function( req,
                                  res,
                                  next ){
      debug( "#retrieve" );
      controller.handleResult( controller.retrieve( {
        _id: req.param( "_id" )
      } ), res, next );
    };
    receiver.list = function( req,
                              res,
                              next ){
      debug( "#list" );
      controller.handleResult( controller.list( req ), res, next );
    };
    receiver.create = function( req,
                                res,
                                next ){
      debug( "#create" );
      controller.handleResult( controller.create( req ), res, next );
    };
    receiver.update = function( req,
                                res,
                                next ){
      debug( "#update" );
      controller.handleResult( controller.update( req ), res, next );
    };
    receiver.remove = function( req,
                                res,
                                next ){
      debug( "#remove" );
      controller.remove( req )
        .then( function( result ){
          res.apiResponse( 204 );
        } ).catch( function( err ){
          next( err );
        } );
    };
    return receiver;
  },

  handleResult: function( p,
                          res,
                          next,
                          isWrapped ){
    debug( "#handleResult" );
    p.then( function( result ){
      if( !isWrapped ){
        result = {
          data: result
        };
      }
      res.apiResponse( result );
    } ).catch( function( err ){
      next( err );
    } );
  },

  retrieve: function( opts ){
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
  create: function( req ){
    debug( "#create" );
    var values = utils.parseValues( {
      fields: this.service.getCreatableFields()
    }, req );
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
  update: function( req ){
    debug( "#update" );
    var opts = {
      values: {
        _id: req.param( "_id" )
      },
      fields: this.service.getEditableFields()
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

  list: function( req ){
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

  remove: function( req ){
    debug( "#remove" );
    return this.service.remove( {
      _id: req.param( "_id" )
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
