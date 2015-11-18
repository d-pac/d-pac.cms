'use strict';
var keystone = require( "keystone" );
var _ = require( 'lodash' );
var P = require( 'bluebird' );

module.exports = {
  //todo: promisify
  sendStageCompleted: function( assessment,
                                callback ){
    return new keystone.Email( {
      templateName: 'stage-completed'
    } ).send( {
      to: keystone.get( "mail admin" ),
      from: keystone.get( "mail noreply" ),
      subject: '[d-pac] (' + keystone.get("root url") + ') Stage fully completed for ' + assessment.name,
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
      to: keystone.get( "mail admin" ),
      from: keystone.get( "mail noreply" ),
      subject: '[d-pac] (' + keystone.get("root url") + ') Assessor ' + assessor.name.full + ' completed stage for ' + assessment.name,
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

