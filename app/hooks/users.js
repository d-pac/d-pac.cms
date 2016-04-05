'use strict';

const _ = require( 'lodash' );
const keystone = require( 'keystone' );
const P = require( 'bluebird' );
const handleHook = require( './helpers/handleHook' );
const usersService = require( '../services/users' );
const constants = require( '../models/helpers/constants' );

function removeAssessmentFromUsers( assessment ){
  const query = [];
  constants.roles.list.forEach( ( roleObj )=>{
    query.push( {
      ["assessments." + roleObj.value]: assessment.id
    } );
  } );
  return usersService.list( {
      $or: query
    } )
    .reduce( ( toBeSaved,
               user )=>{
      let changed = false;
      constants.roles.list.forEach( ( roleObj )=>{
        const role = roleObj.value;
        let index;
        while( (index = _.get( user, [ "assessments", role ], [] ).indexOf( assessment.id )) >= 0 ){
          user.assessments[ role ].splice( index, 1 );
          changed = true;
        }
      } );
      if(changed){
        toBeSaved.push(user);
      }
      return toBeSaved;
    }, [] )
    .mapSeries((modified)=>{
      return modified.save();
    })
}

module.exports.init = function(){
  keystone.list( 'Assessment' ).schema.pre( 'remove', handleHook( removeAssessmentFromUsers ) )
};
