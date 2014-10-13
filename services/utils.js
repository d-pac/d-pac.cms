'use strict';

var _ = require('underscore');

module.exports.toSafeJSON = function toSafeJSON( docs ){
  if( _.isArray( docs ) ){
    return _.map( docs, function( doc ){
      return doc.toSafeJSON();
    } );
  }else{
    return docs.toSafeJSON();
  }
};
