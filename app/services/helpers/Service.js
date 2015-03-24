"use strict";

var _ = require( "underscore" );
var errors = require( "errors" );
var P = require( "bluebird" );
var deepExtend = require( "deep-extend" );

function Service( schema ){
  this.schema = schema;
}

_.extend( Service.prototype, {
  mixin : function( receiver ){
    var methods = _.omit( _.keys( Service.prototype ), "mixin" );
    var service = this;
    receiver = receiver || {};
    _.each( methods, function( methodName ){
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
  list  : function list( opts ){
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
  listById : function listById( ids,
                                opts ){
    if( _.isString( ids ) ){
      return P.promisifyAll( this.schema.model
        .find( _.defaults( {
          _id : ids
        } ), opts ) );
    } else if( _.isArray( ids ) ){
      return P.promisifyAll( this.schema.model.find( opts )
        .where( "_id" ).in( ids ) );
    }

    throw new Error( "Incorrect parameter type for `ids`, `String` or `Array` expected" );
  },

  retrieve : function( opts ){
    return P.promisifyAll(
      this.schema.model
        .findById( opts._id, opts.fields, opts )
    );
  },

  update : function( promise,
                     opts ){
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

  remove : function( opts ){
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

  getName : function( item ){
    return this.schema.getDocumentName( item );
  },

  getEditableFields : function(){
    if( this.schema.api && this.schema.api.editable ){
      return this.schema.api.editable;
    }

    return _.keys( this.schema.fields );
  }
} );

module.exports = Service;
