'use strict';

var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var async = require( 'async' );
var debug = require( "debug" )( "dpac:services.stats" );
var estimate = require( 'estimating-rasch-model' );
var P = require( 'bluebird' );
var diff = require( 'deep-diff' ).diff;

module.exports = {
  estimate: function( representations,
                      comparisons ){
    debug("#estimate");
    var representationDocs, representationObjs;
    var comparisonDocs, comparisonObjs;
    if( _.isArray( representations ) ){
      representationDocs = representations;
      representationObjs = JSON.parse( JSON.stringify( representationDocs ) );
    } else {
      representationDocs = representations.documents;
      representationObjs = representations.objects;
    }

    if( _.isArray( comparisons ) ){
      comparisonDocs = comparisons;
      comparisonObjs = JSON.parse( JSON.stringify( comparisonDocs ) );
    } else {
      comparisonDocs = comparisons.documents;
      comparisonObjs = comparisons.objects;
    }

    setTimeout( function(){
      try{
        estimate.estimateCJ( comparisonObjs, representationObjs );
      } catch( err ) {
        return console.log( err, err.stack );
      }
      var toRanks = _.filter( representationObjs, function( representation ){
        return representation.rankType === "to rank";
      } );

      var saveQueue = [];

      _.each( toRanks, function( representationObj ){
        var doc = _.find( representationDocs, function( representationDoc ){
          return representationDoc.id.toString() === representationObj._id;
        } );
        var diffObj = diff( JSON.parse( JSON.stringify( doc.ability ) ), representationObj.ability );
        if(diffObj){
          console.log( "Differences for", representationObj.name, ":", diffObj);
          _.each(representationObj.ability, function(value, key){
            doc.ability[key] = representationObj.ability[key];
          });
          saveQueue.push( doc );
        }
      } );

      async.eachSeries( saveQueue, function( representation,
                                             next ){
        representation.save( next );
      }, function( err ){
        if( err ){
          return console.log( err );
        }
        console.log( "Updated representations:", saveQueue.length );
      } );
    }, 500 );
  },

  estimateForAssessment: function( assessmentId ){
    debug("#estimateForAssessment");
    var getComparisons = P.promisifyAll( keystone.list( "Comparison" ).model.find( { assessment: assessmentId } ) );
    var getRepresentations = P.promisifyAll( keystone.list( "Representation" ).model.find( { assessment: assessmentId } ) );

    var self = this;
    P.join( getComparisons.execAsync(), getRepresentations.execAsync(), function( comparisonDocs,
                                                                                  representationDocs ){
      self.estimate( representationDocs, comparisonDocs );
    } );
  }

};
