'use strict';
var debug = require( 'debug' )( 'dpac:services.representations' );
var keystone = require( 'keystone' );
var _ = require( 'underscore' );
var Promise = require( 'bluebird' );
var schema = keystone.list( 'Representation' );
var toSafeJSON = require( './utils' ).toSafeJSON;
var ObjectId = require( 'mongoose' ).Types.ObjectId;

var listById = module.exports.listById = function( ids ){
  return schema.model
    .find()
    .where( '_id' ).in( ids )
    .exec()
    .then( function( representations ){
      return toSafeJSON( representations );
    } );
};

var list = module.exports.list = function list( opts ){
  debug( "#list" );
  if( _.isArray( opts ) ){
    return listById( opts );
  }
  return schema.model
    .find( opts )
    .exec()
    .then( function( representations ){
      return toSafeJSON( representations );
    } );
};

module.exports.retrievePair = function retrieveRepresentationPair( opts ){

  debug( 'retrievePair' );
  var judgements = keystone.list( 'Judgement' );
  return schema.model
    .find( {
      assessment : opts.assessment
    } )
    .exec()
    .then(function(representations){
      representations = _.sortBy(representations,function(representation){
        return representation.compared.length;
      });
      var selected = representations.shift();
      var opponent;
      if(selected.compared.length <= 0){
        opponent = representations.shift();
      }else{
        opponent = _.find(representations, function(representation){
          if(representation.compared && representation.compared.length){
            return representation.compared.indexOf(selected._id) < 0;
          }
          return true;
        });
        if(!opponent){
          opponent = representations.shift();
        }
      }

      return [selected, opponent];
    });

};

module.exports.retrieveFull = function retrieveFull( opts ){
  return schema.model
    .findById( opts._id )
    .exec();
};
