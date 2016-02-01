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
        if( result && _.isFunction( result.exec ) ){
          result = result.exec();
        }
        return result;
      }.bind( receiver );
    } );
    return receiver;
  },

  count: function count( opts ){
    debug( '#count', opts );
    return this.schema.model.count( opts );
  },
  list: function list( opts ){
    debug( "#list", opts );
    return this.schema.model
      .find( opts );
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

    return this.schema.model.find( opts )
      .where( "_id" ).in( ids );
  },

  retrieve: function( opts ){
    debug( "#retrieve" );
    return this.schema.model
      .findById( opts._id, opts.fields, _.omit( opts, [ 'fields', '_id' ] ) );
  },

  create: function( opts ){
    debug( "#create", opts );
    return this.schema.model.create( opts );
  },

  update: function( promise,
                    opts ){
    debug( "#update" );
    if( 2 > arguments.length ){
      opts = promise;
      promise = this.retrieve( opts ).exec();
    }

    promise.exec = function(){
      return this.then( ( doc )=>{
        if( doc ){
          deepExtend( doc, opts );
          return doc.save();
        }
      } );
    }.bind( promise );
    return promise;
  },

  remove: function( opts ){
    debug( "#remove" );
    var promise = this.retrieve( opts ).exec();
    promise.exec = function(){
      return this.then( ( doc )=>{
        if( doc ){
          return doc.remove().then( ()=>doc );
        }
      } );
    }.bind( promise );

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
