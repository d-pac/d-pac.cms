"use strict";
var debug = require( "debug" )( "dpac:services.helpers.Service" );

var _ = require( "lodash" );
var errors = require( "errors" );
var P = require( "bluebird" );
var deepExtend = require( "deep-extend" );

function Service( schema ){
  this.schema = schema;
}

_.assignIn( Service.prototype, {
  mixin: function( receiver ){
    var methods = _.omit( _.keys( Service.prototype ), "mixin" );
    var service = this;
    receiver = receiver || {};
    _.forEach( methods, function( methodName ){
      receiver[ methodName ] = function(){
        var args = _.toArray( arguments );
        var result = service[ methodName ].apply( service, args );
        if( result && result.hasOwnProperty( "execAsync" ) ){
          result = result.execAsync();
        }
        return result;
      }.bind( receiver );
    } );
    return receiver;
  },

  count: function count( opts ){
    debug( '#count', opts );
    return P.promisifyAll( this.schema.model.count( opts ) );
  },
  list: function list( opts ){
    debug( "#list", opts );
    return P.promisifyAll(
      this.schema.model
        .find( opts )
    );
  },

  /**
   *
   * @param {(string|string[])} ids
   * @param {object} [opts] Mongoose options
   * @returns {*}
   */
  listById: function listById( ids,
                               opts ){
    debug( "#listById" );
    if( _.isString( ids ) ){
      ids = [ ids ];
    }

    return P.promisifyAll( this.schema.model.find( opts )
      .where( "_id" ).in( ids ) );
  },

  retrieve: function( opts ){
    debug( "#retrieve" );
    return P.promisifyAll(
      this.schema.model
        .findById( opts._id, opts.fields, opts )
    );
  },

  create: function( opts ){
    debug( "#create", opts );
    return P.promisify( this.schema.model.create, this.schema.model )( opts );
  },

  update: function( promise,
                    opts ){
    debug( "#update" );
    if( 2 > arguments.length ){
      opts = promise;
      promise = this.retrieve( opts )
        .execAsync();
    }
    promise.execAsync = _.bind( function(){
      return this.then( function( doc ){
        if( !doc ){
          return P.resolve( [] );
        }
        deepExtend( doc, opts );
        //todo: use/pass getUpdateHandler
        return P.promisify( doc.save, doc )();
      } ).spread( function( mixed ){
        return mixed;
      } );
    }, promise );

    return promise;
  },

  remove: function( opts ){
    debug( "#remove" );
    var promise = this.retrieve( opts )
      .execAsync();
    promise.execAsync = _.bind( function(){
      return this.then( function( doc ){
        if( !doc ){
          return P.resolve( undefined );
        }
        return P.promisify( doc.remove, doc )()
          .then( function(){
            return doc;
          } );
      } );
    }, promise );

    return promise;
  },

  getName: function( item ){
    return this.schema.getDocumentName( item );
  },

  getEditableFields: function(){
    return _.get( this.schema, [ 'api', 'editable' ], _.keys( this.schema.fields ) );
  },

  getCreatableFields: function(){
    return _.get( this.schema, [ 'api', 'creatable' ], _.keys( this.schema.fields ) );
  },

  getFilterableFields: function(){
    return _.get( this.schema, [ 'api', 'filterable' ], _.keys( this.schema.fields ) );
  }
} );

module.exports = Service;
