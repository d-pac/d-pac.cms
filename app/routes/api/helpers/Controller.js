"use strict";
var debug = require( "debug" )( "dpac:api.helpers.Controller" );
var P = require( 'bluebird' );
var _ = require( "lodash" );
var errors = require( "errors" );
var utils = require( "./utils" );

const methods = [ 'list', 'create', 'retrieve', 'update', 'remove' ];

function isThenable( subject ){
  return subject && subject.then && _.isFunction( subject.then );
}

function Controller( service ){
  this.service = service;
}

_.assignIn( Controller.prototype, {
  mixin: function( receiver ){
    receiver = receiver || {};
    methods.forEach( ( method ) =>{
      receiver[ method ] = ( req,
                             res,
                             next ) =>{
        this.handleResult( this[ method ]( req ), res, next );
      };
    } );
    return receiver;
  },

  getResultsByType( res,
                    type ){
    return utils.getResultsByType( res, type );
  },

  handleResult: function( mixed,
                          res,
                          next,
                          opts ){
    debug( "#handleResult" );
    opts = _.defaults(opts, {
      depopulate: true
    });
    function handle( result ){
      if( result ){
        if( result.toJSON ){
          result = result.toJSON( { depopulate: opts.depopulate } );
        }

        let results = _.get( res, [ 'locals', 'results' ], [] );
        _.set( res, [ 'locals', 'results' ], results.concat( result ) );
      }
      next();
    }

    if( isThenable( mixed ) ){
      return mixed.then( handle )
        .catch( function( err ){
          next( err );
        } );
    }

    if( mixed instanceof Error ){
      return next( mixed );
    }

    //just a plain old simple value -or- null, undefined
    return handle( mixed );
  },

  retrieve: function( req ){
    debug( "#retrieve" );
    return this.service
      .retrieve( {
        _id: req.params._id
      } )
      .then( function( result ){
        if( !result ){
          throw new errors.Http404Error();
        }
        return result;
      } );
  },

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
        result.isNew = true;
        return result;
      } );
  },

  update: function( req ){
    debug( "#update" );
    var opts = {
      values: {
        _id: req.params._id
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
    var filter = {};
    var qFilter = _.get( req, [ 'query', 'filter' ], '' );
    if( qFilter && _.isString( qFilter ) ){
      try{
        qFilter = JSON.parse( qFilter );
      } catch( err ) {
        debug( 'Error: filter is not JSON parseable', qFilter );
      }
      filter = _.pick( qFilter, this.service.getFilterableFields() );
      if( _.keys( qFilter ).length !== _.keys( filter ).length ){
        return P.reject( new errors.Http400Error( { explanation: 'Specified field not filterable' } ) );
      }
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
        _id: req.params._id
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
