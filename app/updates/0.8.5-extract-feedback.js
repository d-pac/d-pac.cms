'use strict';

const _ = require( 'lodash' );
const log = _.partial( console.log, require( 'path' ).basename( __filename ) + ':' );
const moment = require( 'moment' );
const keystone = require( 'keystone' );
const P = require( 'bluebird' );
const constants = require( '../models/helpers/constants' );
const comparisonsService = require( '../services/comparisons' );
const feedbackService = require( '../services/feedback' );

const Feedback = keystone.list( 'Feedback' );

module.exports = ( done ) =>{
  const t0 = moment();
  Feedback.model.remove( {} )
    .then( ()=>{
      return comparisonsService.list( {
        ["data." + constants.PROSCONS]: { $exists: true }
      } );
    } )
    .each( ( comparison ) =>{
      const proscons = comparison.data[ constants.PROSCONS ];
      if( proscons ){
        const aId = comparison.representations.a;
        const bId = comparison.representations.b;
        const authorId = comparison.assessor;
        return P.props( {
            a: feedbackService.list( {
                representation: aId,
                author: authorId
              } )
              .then( ( single )=>single[ 0 ] ),
            b: feedbackService.list( {
                representation: bId,
                author: authorId
              } )
              .then( ( single )=>single[ 0 ] )
          } )
          .then( ( feedback ) =>{
            if( !feedback.a ){
              feedback.a = new Feedback.model( {
                representation: aId,
                author: authorId
              } );
            }
            if( !feedback.b ){
              feedback.b = new Feedback.model( {
                representation: bId,
                author: authorId
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
    .then(()=>{
      return feedbackService.count({});
    })
    .then( (n) =>{
      log( `Finished creating ${n} feedback records in ${moment().diff( t0, 'seconds', true )} seconds.` );
      done();
    } )
    .catch( ( err ) => done( err ) );
};
