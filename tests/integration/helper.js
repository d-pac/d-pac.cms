'use strict';
var _ = require( 'lodash' );

module.exports = function( model ){
  return {
    isInstanceOf: function( doc ){
      return doc instanceof model;
    },

    areEqual: function( docOrIdA,
                        docOrIdB ){
      var docIdA = (this.isInstanceOf( docOrIdA ))
        ? docOrIdA._id
        : docOrIdA;
      var docIdB = (this.isInstanceOf( docOrIdB ))
        ? docOrIdB._id
        : docOrIdB;
      return docIdA.equals( docIdB );
    },

    occursInList: function( list,
                            docOrId ){
      var docId = (this.isInstanceOf( docOrId ))
        ? docOrId._id
        : docOrId;
      return !!_.find( list, function( itemId ){
        return itemId.equals( docId );
      } );
    }
  };
};
