'use strict';
const debug = require( "debug" )( "dpac:updates/0.8.0-extract-feedback" );

const lodash = require( 'lodash' );
const moment = require( 'moment' );
const keystone = require( 'keystone' );
const P = require( 'bluebird' );
const constants = require( '../models/helpers/constants' );
const comparisonsService = require( '../services/comparisons' );
const feedbackService = require( '../services/feedback' );

const Feedback = keystone.list( 'Feedback' );

module.exports = ( done ) =>{
  let t0 = moment();
  let created = 0;
  let counter = 0;
  comparisonsService.listPopulated( {
      ["data." + constants.PROSCONS]: { $exists: true }
    } )
    .each( ( comparison ) =>{
      debug( 'Processing:', comparison._id, comparison._rid );
      const proscons = comparison.data[ constants.PROSCONS ];
      if( proscons ){
        const aId = comparison.representations.a.document;
        const bId = comparison.representations.b.document;
        const authorId = comparison.assessor;
        return P.props( {
            a: feedbackService.list( {
                document: aId,
                author: authorId
              } )
              .then( ( single )=>single[ 0 ] ),
            b: feedbackService.list( {
                document: bId,
                author: authorId
              } )
              .then( ( single )=>single[ 0 ] )
          } )
          .then( ( feedback ) =>{
            if( !feedback.a){
              created++;
              feedback.a = new Feedback.model( {
                document: comparison.representations.a.document,
                author: comparison.assessor
              } );
            }
            if( !feedback.b ){
              created++;
              feedback.b = new Feedback.model( {
                document: comparison.representations.b.document,
                author: comparison.assessor
              } );
            }
            let saveA = false;
            if( proscons.aPositive ){
              feedback.a.positive = proscons.aPositive;
              saveA = true;
            }
            if( proscons.aNegative ){
              feedback.a.negative = proscons.aNegative;
              saveA = true;
            }
            let saveB = false;
            if( proscons.bPositive ){
              feedback.b.positive = proscons.bPositive;
              saveB = true;
            }
            if( proscons.bNegative ){
              feedback.b.negative = proscons.bNegative;
              saveB = true;
            }
            const save = [];
            if( saveA ){
              save.push( feedback.a.save() );
            }
            if( saveB ){
              save.push( feedback.b.save() );
            }
            return P.all( save );
          } )
          .catch( ( err )=>console.log( err ) );
      }

    } )
    .then( () =>{
      let t1 = moment();
      console.log( `Created ${created} Feedback documents in ${t1.diff( t0, 'seconds', true )} seconds.` );
      done();
    } )
    .catch( ( err ) => done( err ) );
};
