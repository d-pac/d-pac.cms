"use strict";

var _ = require( "underscore" );
var errors = require( "errors" );
var P = require( "bluebird" );
var deepExtend = require( "deep-extend" );

function Service( schema ){
  this.schema = schema;
}

_.extend( Service.prototype, {

  list : function list( opts ){
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
  listByid : function listById( ids,
                                opts ){
    if( _.isString( ids ) ){
      return this.list( _.defaults( {
        _id : ids
      } ), opts );
    } else if( _.isArray( ids ) ){
      return this.list( opts )
        .where( "_id" ).in( opts );
    }

    throw new Error( "Incorrect parameter type for `ids`, `String` or `Array` expected" );
  },

  retrieve : function( opts ){
    return P.promisifyAll(
      this.schema.model
        .findById( opts._id, opts.fields, opts )
    );
  },

  update : function( opts ){
    var promise = this.retrieve( opts )
      .execAsync();
    promise.execAsync = _.bind( function(){
      return this.then( function( doc ){
        if( !doc ){
          return P.resolve( [] );
        }
        deepExtend( doc, opts );
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
  }
} );

module.exports = Service;
