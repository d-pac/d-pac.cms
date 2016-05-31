'use strict';

const scheduler = require( 'node-schedule' );
const P = require( 'bluebird' );
const _ = require( 'lodash' );
const moment = require( 'moment' );
const constants = require( '../models/helpers/constants' );
const keystone = require( 'keystone' );
const usersService = require( '../services/users' );
const messagesService = require( '../services/messages' );
const assessmentsService = require( '../services/assessments' );
const mailsService = require( '../services/mails' );
const handleHook = require( './helpers/handleHook' );

const commandsByRecipient = {
  [constants.recipientTypes.ASSESSORS.value]: ( message )=>
    usersService.listForAssessments( 'assessor', [ message.assessment ] ),
  [constants.recipientTypes.ASSESSEES.value]: ( message ) =>
    usersService.listForAssessments( 'assessee', [ message.assessment ] ),
  [constants.recipientTypes.ASSESSMENT.value]: ( message )=>
    usersService.listForAssessments( 'both', [ message.assessment ] ),
  [constants.recipientTypes.PAM.value]: ( message )=>{
    return assessmentsService.retrieve( { _id: message.assessment } )
      .then( ( assessment )=> usersService.retrieve( { _id: assessment.createdBy } ) )
      .then( ( user )=>[ user ] )
      ;
  },
  [constants.recipientTypes.ANY.value]: ( message ) => usersService.listById( message.recipients ),
  [constants.recipientTypes.ADMIN.value]: ( message ) => keystone.get( "mail admin" )
};

function addToLog( message,
                   text ){
  const now = '[' + moment().format( 'DD/MM/YY HH:mm:ss' ) + '] ';
  message.log = now + text + '<br/>' + ( message.log || '');
  return message;
}

function getRecipients( message ){
  const command = commandsByRecipient[ message.recipientType ]
    || commandsByRecipient[ constants.recipientTypes.ADMIN.value ];
  return command( message );
}

function sendMessage( message ){
  return P.join(
    getRecipients( message ),
    usersService.retrieve( {
      _id: message.createdBy
    } ),
    function( recipients,
              user ){
      //const to = _.map( recipients, 'namedEmail' );
      return mailsService.sendMessage( {
        to: recipients,
        from: user,
        subject: message.subject,
        body: message.body
      } );
    } )
    .then( function( result ){
      message.state = 'handled';
      _.forEach( result, function( item ){
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
      return message.save();
    } );

}

function handleMessageStrategy( message ){
  if( message.isNew && !message.fromAPI ){
    addToLog( message, 'Draft created' );
  } else {
    if( message.state === 'handled' && !keystone.get( 'dev env' ) ){
      return P.reject( new Error( 'You cannot resend a message' ) );
    }
    switch( message.strategy ){
      case 'send':
        if( !message.confirm ){
          return P.reject( new Error( 'You must confirm immediate sending' ) );
        }
        return sendMessage( message );
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
  return P.resolve();
}

module.exports.init = function(){
  keystone.list( 'Message' ).schema.pre( 'save', handleHook( handleMessageStrategy ) );
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
