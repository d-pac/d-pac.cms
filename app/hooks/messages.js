'use strict';
var scheduler = require( 'node-schedule' );
var P = require( 'bluebird' );
var _ = require( 'lodash' );
var moment = require( 'moment' );
var constants = require( '../models/helpers/constants' );
var keystone = require( 'keystone' );
var usersService = require( '../services/users' );
var messagesService = require( '../services/messages' );
var assessmentsService = require( '../services/assessments' );
var mailsService = require( '../services/mails' );

function addToLog( message,
                   text ){
  var now = '[' + moment().format( 'DD/MM/YY HH:mm:ss' ) + '] ';
  message.log = now + text + '<br/>' + ( message.log || '');
  return message;
}

function getRecipients( message ){
  switch( message.recipientType ){
    case constants.recipientTypes.ASSESSORS.value:
      return usersService.listForAssessments( 'assessor', [ message.assessment ] );
      break;
    case constants.recipientTypes.ASSESSEES.value:
      return usersService.listForAssessments( 'assessee', [ message.assessment ] );
      break;
    case constants.recipientTypes.ASSESSMENT.value:
      return usersService.listForAssessments( 'both', [ message.assessment ] );
      break;
    case constants.recipientTypes.PAM.value:
      return assessmentsService
        .retrieve( {
          _id: message.assessment
        } )
        .then( function( assessment ){
          return usersService.retrieve( {
            _id: assessment.createdBy
          } );
        } )
        .then( function( user ){
          return [ user ];
        } );
      break;
    case constants.recipientTypes.ANY.value:
      return usersService.listById( message.recipients );
      break;
    case constants.recipientTypes.ADMIN.value:
    default:
      return keystone.get("mail admin");
      break;
  }
}

function sendMessage( message ){
  return P.join(
    getRecipients( message ),
    usersService.retrieve( {
      _id: message.createdBy
    } ),
    function( recipients,
              user ){
      //var to = _.pluck( recipients, 'namedEmail' );
      return mailsService.sendMessage( {
        to: recipients,
        from: user,
        subject: message.subject,
        body: message.body
      } );
    } )
    .then( function( result ){
      message.state = 'handled';
      _.each( result, function( item ){
        if( item.status === 'rejected' ){
          addToLog( message, 'E-mail rejected: ' + item.reject_reason );
        } else {
          addToLog( message, 'E-mail queued for sending successfully.' );
        }
      } );
    } );
}

function sendScheduledMessages(){
  //console.log( 'Sending scheduled messages:', moment().format( 'DD/MM/YY HH:mm:ss' ) );
  return messagesService.list( {
      strategy: 'scheduled',
      schedule: {
        $lte: new Date()
      }
    } )
    .each( function( message ){
      console.log( 'Scheduler: auto-sending message', message.subject );
      message.strategy = 'send';
      message.confirm = true;
      addToLog( message, 'Scheduled time matched' );
      return P.promisify( message.save, message )();
    } );

}

function messageSavedHandler( done ){
  var message = this;
  if( message.isNew && !message.fromAPI ){
    addToLog( message, 'Draft created' );
  } else {
    if( message.state === 'handled' && !keystone.get('dev env') ){
      return done( new Error( 'You cannot resend a message' ) );
    }
    switch( message.strategy ){
      case 'send':
        if( !message.confirm ){
          return done( new Error( 'You must confirm immediate sending' ) );
        }
        return sendMessage( message )
          .then( function(){
            done();
          } )
          .catch( function( err ){
            done( new Error( err.message ) );
          } );
        break;
      case 'scheduled':
        addToLog( message, 'E-mail scheduled for ' + moment( message.schedule ).format( 'DD/MM/YY HH:mm:ss' ) );
        message.state = 'scheduled';
        break;
      case 'draft':
        message.state = 'editing';
        break;
      default:
        //do nothing
        break;
    }
  }
  done();
}

module.exports.init = function(){
  keystone.list( 'Message' ).schema.pre( 'save', messageSavedHandler );
  keystone.post( 'updates', function( done ){
    //every 15 minutes
    scheduler.scheduleJob( '*/15 * * * *', sendScheduledMessages );
    sendScheduledMessages()
      .catch( function( err ){
        console.log( 'Scheduled messages actions failure:' + err );
      } );
    done();// call immediately, we don't want to wait on this!
  } );
};
