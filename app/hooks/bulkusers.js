'use strict';

const keystone = require( 'keystone' );
const _ = require( 'lodash' );
const P = require( 'bluebird' );
const path = require( 'path' );
const utils = require( 'keystone-utils' );

const convertersService = require( '../services/converters' );
const usersService = require( '../services/users' );
const constants = require( '../models/helpers/constants' );
const handleHook = require( './helpers/handleHook' );
const fsutils = require( './helpers/filesystem' );

function parseUserData( opts ){
  return convertersService.userCSVtoJson( opts );
}

function handleUsers( bulkupload ){
  if( !bulkupload.csvfile || !bulkupload.csvfile.filename ){
    return P.reject( new Error( 'CSV file is required!' ) );
  }

  const opts = {
    path: path.resolve( path.join( constants.directories.bulk, bulkupload.csvfile.filename ) )
  };

  return parseUserData( opts )
    .map( ( raw ) =>{
      let action;
      return P.try( function(){
        const cleanEmail = raw.email = _.trim( raw.email.toLowerCase() );
        return new RegExp( '^' + utils.escapeRegExp( cleanEmail ) + '$', 'i' );
      } )
        .then( function( emailRegExp ){
          return usersService.list( { email: emailRegExp } );
        } )
        .then( ( users ) =>{
          let user;
          if( users.length ){
            action = 'update';
            user = users[ 0 ];
            if( raw.password ){
              user.password = raw.password;
            }
          } else {
            action = 'created';
            if( !raw.password ){
              raw.password = "changeme";
            }
            if( bulkupload.sendInvites ){
              raw.actions = { sendInviteMail: true };
            }
            user = new usersService.collection.model( raw );
          }
          bulkupload.assessment.forEach( ( assessmentId ) =>{
            if( bulkupload.roles.asAssessee && user.assessments.assessee.indexOf( assessmentId ) < 0 ){
              user.assessments.assessee.push( assessmentId );
            }
            if( bulkupload.roles.asAssessor && user.assessments.assessor.indexOf( assessmentId ) < 0 ){
              user.assessments.assessor.push( assessmentId );
            }
            if( bulkupload.roles.asPAM && user.assessments.pam.indexOf( assessmentId ) < 0 ){
              user.assessments.pam.push( assessmentId );
            }
          } );
          return user.save()
            .then(function(  ){
              bulkupload.log += `${action}d user: ${user.email}<br/>`;
            })
            .catch( ( err ) =>{
              //we just want to log these
              bulkupload.log += `Could not ${action} user for data ${JSON.stringify( raw )}<br/>`;
            } );
        } )
        .catch( ( err ) => P.reject( err ) );
    } )
    .then( function(){
      return fsutils.cleanup( [ opts.path ] );
    } )
    .then( function(){
      bulkupload.csvfile = {
        "filename": "",
        "originalname": "",
        "path": "",
        "size": 0,
        "filetype": "0"
      };
      bulkupload.completed = true;
    } );
}

function bulkuserSavedHandler( bulkupload ){
  if( bulkupload.completed && !keystone.get( 'dev env' ) ){
    return P.reject( new Error( 'You cannot reuse bulk uploads. (Seriously that would mean a world of pain)' ) );
  }

  if( bulkupload.isNew ){
    return P.resolve();
  }

  return handleUsers( bulkupload )
    .then( function(){
      bulkupload.log += "Bulk users successfully completed.";
    } )
    .catch( function( err ){
      bulkupload.log += "Bulk users failed: " + err.message;
    } );
}

module.exports.init = function(){
  keystone.list( 'Bulkuser' ).schema.pre( 'save', handleHook( bulkuserSavedHandler ) );
};
