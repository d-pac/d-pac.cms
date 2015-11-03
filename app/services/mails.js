'use strict';
var keystone = require( "keystone" );
var _ = require( 'lodash' );
var P = require( 'bluebird' );

//todo: move this to settings
var to = [ 'info@d-pac.be' ];
var from = {
  name: "automated d-pac mailer",
  email: "no-reply@d-pac.be"
};

module.exports = {
  //todo: promisify
  sendStageCompleted: function( assessment,
                                callback ){
    return new keystone.Email( {
      templateName: 'stage-completed'
    } ).send( {
      to: to,
      from: from,
      subject: '[d-pac] (' + process.env.ROOT_URL + ') Stage fully completed for ' + assessment.name,
      body: {
        assessment: assessment
      }
    }, callback );
  },
  sendAssessorStageCompleted: function( assessor,
                                        assessment,
                                        callback ){
    //todo: promisify
    return new keystone.Email( {
      templateName: 'assessor-stage-completed'
    } ).send( {
      to: to,
      from: from,
      subject: '[d-pac] (' + process.env.ROOT_URL + ') Assessor ' + assessor.name.full + ' completed stage for ' + assessment.name,
      body: {
        assessment: assessment,
        assessor: assessor
      }
    }, callback );
  },
  sendMessage: function( message ){
    return new P( function( resolve,
                            reject ){
      var mail = new keystone.Email( {
        templateName: 'message'
      } );
      return mail.send( {
        to: message.to,
        from: message.from,
        subject: message.subject,
        body: message.body
      }, function( err,
                   result ){
        if( err ){
          return reject( err );
        }
        return resolve( result );
      } );
    } );
  }
};

