'use strict';
var keystone = require( 'keystone' );
var Representation = keystone.list( 'Representation' );

module.exports.retrievePair = function retrieveRepresentationPair( opts ){

  //debug('retrieveRepresentations');
  //todo: replace this with CJ
  return Representation.model
    .find()
    .sort( { createdAt : -1 } )
    .limit( 2 )
    .lean()
    .exec()
    .then(function(representations){
      if( !representations || representations.length <= 1 ){
        throw new Error('No representations');
      }

      return representations;
    });
};

module.exports.retrieve = function retrieve(opts){
  return Representation.model
    .findById(opts._id)
    .exec();
};
