"use strict";
const _ = require( 'lodash' );
const keystone = require( 'keystone' );
const Assessment = keystone.list( 'Assessment' );
const constants = require( '../models/helpers/constants' );
const log = _.partial( console.log, require( 'path' ).basename( __filename ) + ':' );

module.exports = ( done ) =>{
  Assessment.model.update( { state: 'calculated' },
    {
      state: constants.assessmentStates.PUBLISHED,
      "stats.lastRun": Date.now()
    },
    { multi: true },
    ( err,
      raw )=>{
      log( 'Updated', raw.n, 'assessments' );
      done( err );
    } )
};
