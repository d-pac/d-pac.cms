'use strict';
var debug = require( 'debug' )( 'dpac:services.representations' );
var keystone = require( 'keystone' );
var _ = require( 'underscore' );
var Promise = require( 'bluebird' );
var schema = keystone.list( 'Representation' );
var toSafeJSON = require( './utils' ).toSafeJSON;
var ObjectId = require( 'mongoose' ).Types.ObjectId;

var list = module.exports.list = function list( opts ){
  debug( "#list" );
  var query = schema.model
    .find( opts );
  if( _.isArray( opts ) ){
    query = query.where( '_id' ).in( opts );
  }
  return query
    .exec()
    .then( function( representations ){
      return toSafeJSON( representations );
    } );
};

var listById = module.exports.listById = function listById( ids ){
  return module.exports.list( ids );
};

module.exports.retrievePair = function retrieveRepresentationPair( opts ){

  debug( 'retrievePair' );
  var judgements = keystone.list( 'Judgement' );
  return schema.model
    .find( {
      assessment : opts.assessment
    } )
    .exec()
    .then( function( representations ){
      if( !representations || representations.length <= 0 ){
        return [];
      }else{
        representations = _.sortBy( _.shuffle( representations ), function( representation ){
          return representation.comparedNum;
        } );
        var selected = representations.shift();
        var opponent;
        if( selected.comparedNum <= 0 ){
          opponent = representations.shift();
        }else{
          opponent = _.find( representations, function( representation ){
            return representation.compared.indexOf( selected._id ) < 0;
          } );
          if( !opponent ){
            opponent = representations.shift();
          }
        }
        return [selected, opponent];
      }
    } );

};

module.exports.retrieveFull = function retrieveFull( opts ){
  return schema.model
    .findById( opts._id )
    .exec();
};
