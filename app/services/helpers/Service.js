"use strict";

const _ = require( "lodash" );
const deepExtend = require( "deep-extend" );

function Service( collection, debug ){
  this.collection = collection;
  this.debug = debug;
}

_.assignIn( Service.prototype, {
  mixin: function( receiver ){
    const methods = _.omit( _.keys( Service.prototype ), "mixin" );
    const service = this;
    receiver = receiver || {};
    _.forEach( methods, function( methodName ){
      receiver[ methodName ] = function(){
        const args = _.toArray( arguments );
        let result = service[ methodName ].apply( service, args );
        if( result && _.isFunction( result.exec ) ){
          result = result.exec();
        }
        return result;
      };
    } );
    receiver.collection = this.collection;
    return receiver;
  },

  count: function count( opts ){
    this.debug( '#count', opts );
    return this.collection.model.count( opts );
  },
  list: function list( opts ){
    this.debug( "#list", opts );
    return this.collection.model
      .find( opts );
  },

  listById: function listById( ids,
                               opts ){
    this.debug( "#listById" );
    if( _.isString( ids ) ){
      ids = [ ids ];
    }

    ids = ids.filter( ( item )=>{
      return !!item;
    } );

    return this.collection.model.find( opts )
      .where( "_id" ).in( ids );
  },

  retrieve: function( opts ){
    this.debug( "#retrieve" );
    return this.collection.model
      .findById( opts._id, opts.fields, _.omit( opts, [ 'fields', '_id' ] ) );
  },

  create: function( opts ){
    this.debug( "#create", opts );
    return this.collection.model.create( opts );
  },

  update: function( promise,
                    opts ){
    this.debug( "#update" );
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
    this.debug( "#remove" );
    const promise = this.retrieve( opts ).exec();
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
    return this.collection.getDocumentName( item );
  },

  getEditableFields: function(){
    return _.get( this.collection, [ 'api', 'editable' ], _.keys( this.collection.fields ) );
  },

  getCreatableFields: function(){
    return _.get( this.collection, [ 'api', 'creatable' ], _.keys( this.collection.fields ) );
  },

  getFilterableFields: function(){
    return _.get( this.collection, [ 'api', 'filterable' ], _.keys( this.collection.fields ) );
  }
} );

module.exports = Service;
