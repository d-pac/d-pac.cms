"use strict";
const debug = require( "debug" )( "dpac:services.comparisons" );
const keystone = require( "keystone" );
const _ = require( "lodash" );
const P = require( "bluebird" );
const benchmark = require( '../lib/benchmark' );

const collection = keystone.list( "Comparison" );
const Service = require( "./helpers/Service" );
const assessmentsService = require( './assessments' );
const representationsService = require( './representations' );

const base = new Service( collection, debug );
module.exports = base.mixin();

module.exports.listPopulated = ( opts ) =>{
  return base.list( opts )
    .populate( 'representations.a representations.b' )
    .exec();
};

module.exports.listLean = ( opts ) =>{
  return base.list( opts )
    .lean()
    .exec();
};

module.exports.completedCount = function completedCount( opts ){
  debug( "#completedCount" );
  opts = _.defaults( opts, {
    completed: true
  } );

  return base.count( opts ).exec();
};

module.exports.listForAssessments = function listForAssessments( opts,
                                                                 assessmentIds ){
  debug( "#listForAssessments", opts, assessmentIds );
  return base.list( opts )
    .where( "assessment" ).in( assessmentIds )
    .exec();
};

module.exports.listForRepresentation = function listForRepresentation( representation ){
  //return base.list({})
  //  .where( { "representations.a": representation.id } )
  //  //.or( [ { "representations.b": representation.id } ] )
  //  .exec();
  return base.list( {
    $or: [
      { "representations.a": representation.id },
      { "representations.b": representation.id }
    ]
  } ).exec();
};

module.exports.create = function( opts ){
  debug( '#create', opts );
  const b = benchmark( true, keystone.get( 'dev env' ) );
  const cache = {
    representations: null,
    comparisons: null,
    assessment: null
  };
  return representationsService.listWithoutUser( opts.assessor.id, {
    assessment: opts.assessment
  } )
    .then( ( representations )=>{
      b.snap( 'retrieved representations' );
      if(representations.length < 2){
        throw new Error( 'assessment-incorrectly-configured' );
      }
      cache.representations = representations;
      return this.listLean( {
        assessment: opts.assessment
      } );
    } )
    .then( ( comparisons )=>{
      b.snap( 'retrieved comparisons' );
      cache.comparisons = comparisons;
      return assessmentsService.retrieve( {
        _id: opts.assessment
      } );
    } )
    .then( ( assessment )=>{
      b.snap( 'retrieved assessment' );
      cache.assessment = assessment;
      return cache;
    } )
    .then( function( results ){
        const representations = results.representations;
        const comparisons = results.comparisons;
        const assessment = results.assessment;
        let data;
        const plainComparisons = JSON.parse( JSON.stringify( comparisons ) );
        const plainRepresentations = JSON.parse( JSON.stringify( representations ) );
        const plainAssessment = JSON.parse( JSON.stringify( assessment ) );
        b.snap( 'Objectified models' );
        try{
          data = require( assessment.algorithm ).select( {
            representations: plainRepresentations,
            comparisons: plainComparisons,
            assessment: plainAssessment,
            assessor: opts.assessor.id
          } );
        } catch( error ) {
          console.log( error );
          throw new Error( 'assessment-incorrectly-configured' );
        }
        b.snap( 'selected representations pair' );
        let p;

        if( data.result && data.result.length ){
          const selectedPair = ( keystone.get( "disable selection shuffle" ) )
            ? data.result
            : _.shuffle( data.result );
          const repIds = {
            a: selectedPair[ 0 ],
            b: selectedPair[ 1 ]
          };

          p = base.create( {
            assessment: opts.assessment,
            assessor: opts.assessor._id,
            phase: assessment.phases[ 0 ],
            representations: {
              a: repIds.a,
              b: repIds.b
            }
          } )
            .then( function( comparison ){
              b.snap( 'created comparison' );
              return P.props( {
                a: representationsService.retrieve( { _id: repIds.a } ),
                b: representationsService.retrieve( { _id: repIds.b } ),
                comparison: comparison
              } );
            } )
            .then( function( aggregate ){
              b.snap( 'retrieved selected representations' );
              aggregate.comparison.representations.a = aggregate.a;
              aggregate.comparison.representations.b = aggregate.b;
              return aggregate.comparison;
            } );
        } else if( data.messages ){
          data.type = "messages";
          p = P.resolve( data );
        }
        return p;
      }
    );
};

module.exports.listRepresentationsForComparisons = function( comparisons ){
  const ids = _.reduce( comparisons, function( memo,
                                             comparison ){
    return memo.concat( _.values( _.pick( comparison.representations, "a", "b", "c", "d" ) ) );
  }, [] );
  return representationsService.listById( ids );
};
