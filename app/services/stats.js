'use strict';

var _ = require( 'lodash' );
var keystone = require( 'keystone' );
var async = require( 'async' );
var debug = require( "debug" )( "dpac:services.stats" );
var estimate = require( 'estimating-rasch-model' );
var P = require( 'bluebird' );
var diff = require( 'deep-diff' ).diff;
var usersService = require( './users' );
var comparisonsService = require( './comparisons' );
var representationsService = require( './representations' );
var timelogsService = require( './timelogs' );
var fns = require( 'd-pac.functions' );

var getAbility = _.partialRight( _.get, [ 'ability', 'value' ] );
var getSE = function( item ){
  var se = _.get( item, [ 'ability', 'se' ], 0 );
  if( se > 3 ){
    return 3;
  }
  return se;
};
var getReliability = fns.pm.reliabilityFunctor( getAbility, getSE );

module.exports = {
  estimate: function( representations,
                      comparisons ){
    debug( "#estimate" );
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

    var succeed, fail;
    var promise = new P( function( resolve,
                                   reject ){
      succeed = resolve;
      fail = reject;
    } );

    setTimeout( function(){
      try{
        estimate.estimateCJ( comparisonObjs, representationObjs );
      } catch( err ) {
        console.log( err, err.stack );
        //return fail( err );
      }
      var toRanks = _.filter( representationObjs, function( representation ){
        return representation.rankType === "to rank";
      } );

      var saveQueue = [];

      _.forEach( toRanks, function( representationObj ){
        var doc = _.find( representationDocs, function( representationDoc ){
          return representationDoc.id.toString() === representationObj._id;
        } );
        var diffObj = diff( JSON.parse( JSON.stringify( doc.ability ) ), representationObj.ability );
        if( diffObj ){
          console.log( "Differences for", representationObj.name, ":", diffObj );
          _.forEach( representationObj.ability, function( value,
                                                       key ){
            doc.ability[ key ] = representationObj.ability[ key ];
          } );
          saveQueue.push( doc );
        }
      } );

      async.eachSeries( saveQueue, function( representation,
                                             next ){
        representation.save( next );
      }, function( err ){
        if( err ){
          console.log( err );
          //return fail( err );
        }
        //console.log( "Updated representations:", saveQueue.length );
        succeed( saveQueue );
      } );
    }, 500 );

    return promise;
  },

  estimateForAssessment: function( assessmentId ){
    debug( "#estimateForAssessment" );
    var getComparisons = P.promisifyAll( keystone.list( "Comparison" ).model.find( { assessment: assessmentId } ) );
    var getRepresentations = P.promisifyAll( keystone.list( "Representation" ).model.find( { assessment: assessmentId } ) );

    var self = this;
    return P.join( getComparisons.execAsync(), getRepresentations.execAsync(), function( comparisonDocs,
                                                                                         representationDocs ){
      return self.estimate( representationDocs, comparisonDocs );
    } );
  },

  statsForAssessment: function( assessment ){
    var assessmentId = assessment.id;
    return P.props( {
        assessors: usersService.listForAssessments( 'assessor', [ assessmentId ] ),
        comparisons: comparisonsService.listForAssessments( {}, [ assessmentId ] ),
        toRankRepresentations: representationsService.list( {
          assessment: assessmentId,
          rankType: "to rank"
        } )
      } )
      .then( function( docs ){
        docs.timelogs = timelogsService.listForComparisonIds( _.map( docs.comparisons, '_id' ) );
        return P.props( docs );
      } )
      .then( function( docs ){
        var totals = {
          reliability: getReliability( docs.toRankRepresentations ),
          assessorsNum: docs.assessors.length,
          comparisonsNum: docs.comparisons.length,
          representationsNum: docs.toRankRepresentations.length,
          duration: _.reduce( docs.timelogs, function( memo,
                                                       timelog ){
            return memo + timelog.duration;
          }, 0 )
        };
        var byRepresentation = _.reduce( docs.comparisons, function( memo,
                                                                     comparison ){
          var aId = comparison.representations.a.toString();
          var bId = comparison.representations.b.toString();
          _.set( memo, [ aId, 'comparisonsNum' ], _.get( memo, [ aId, 'comparisonsNum' ], 0 ) + 1 );
          _.set( memo, [ bId, 'comparisonsNum' ], _.get( memo, [ bId, 'comparisonsNum' ], 0 ) + 1 );
          return memo;
        }, {} );
        return {
          totals: totals,
          averages: {
            comparisonsPerRepresentation: ((totals.comparisonsNum / totals.representationsNum) * 2).toFixed( 3 ),
            comparisonsPerAssessor: (totals.comparisonsNum / totals.assessorsNum).toFixed( 3 ),
            durationPerAssessor: (totals.duration / totals.assessorsNum).toFixed( 3 ),
            durationPerRepresentation: (totals.duration / totals.representationsNum).toFixed( 3 )
          },
          byRepresentation: byRepresentation
        }
      } );
  },
};
