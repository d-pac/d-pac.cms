'use strict';
var keystone = require( "keystone" );

var to = [ 'info@d-pac.be' ];
var from = {
  name: "automated d-pac mailer",
  email: "no-reply@d-pac.be"
};

module.exports = {
  sendStageCompleted: function( assessment,
                                callback ){
    return new keystone.Email( {
      templateName: 'stage-completed'
    } ).send( {
        to: to,
        from: from,
        subject: '[d-pac] Stage fully completed for ' + assessment.name,
        body: {
          assessment: assessment
        }
      }, callback );
  },
  sendAssessorStageCompleted: function( assessor,
                                        assessment,
                                        callback ){
    return new keystone.Email( {
      templateName: 'assessor-stage-completed'
    } ).send( {
        to: to,
        from: from,
        subject: '[d-pac] Assessor ' + assessor.name.full + ' completed stage for ' + assessment.name,
        body: {
          assessment: assessment,
          assessor: assessor
        }
      }, callback );
  }
};

