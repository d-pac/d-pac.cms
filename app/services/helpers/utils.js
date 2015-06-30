"use strict";

var _ = require( "lodash" );

module.exports.toSafeJSON = function toSafeJSON( docs ){
  if( _.isArray( docs ) ){
    return _.map( docs, function( doc ){
      return doc.toSafeJSON();
    } );
  } else {
    return docs.toSafeJSON();
  }
};
