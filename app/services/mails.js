'use strict';
const keystone = require("keystone");
const P = require('bluebird');
const util = require('util');

function dummyMailer() {
  return {
    send: function (opts, callback) {
      console.log('DUMMY MAIL', util.inspect(opts));
      callback();
    }
  };
}

const Mailer = keystone.get('dev env') ? dummyMailer : keystone.Email;

module.exports = {
  //todo: promisify
  sendStageCompleted: function (assessment,
                                callback) {
    return new Mailer({
      templateName: 'stage-completed'
    })
      .send({
        to: keystone.get("mail admin"),
        from: keystone.get("mail noreply"),
        subject: '[d-pac] (' + keystone.get("root url") + ') Stage fully completed for ' + assessment.name,
        body: {
          assessment: assessment
        }
      }, callback);
  },
  sendAssessorStageCompleted: function (assessor,
                                        assessment,
                                        callback) {
    //todo: promisify
    return new Mailer({
      templateName: 'assessor-stage-completed'
    })
      .send({
        to: keystone.get("mail admin"),
        from: keystone.get("mail noreply"),
        subject: '[d-pac] (' + keystone.get("root url") + ') Assessor ' + assessor.name.full + ' completed stage for ' + assessment.name,
        body: {
          assessment: assessment,
          assessor: assessor
        }
      }, callback);
  },

  sendWelcome(user) {
    const mail = new Mailer({
      templateName: 'welcome-user'
    });
    return P.fromCallback(callback => mail.send({
      user: user,
      from: keystone.get("mail noreply"),
      to: user.email,
      subject: "Welcome to " + keystone.get("brand")
    }, callback))
      .catch((err) => {
        console.log(err);
      });
  },

  sendMessage: function (message) {
    const mail = new Mailer({
      templateName: 'message'
    });
    return P.fromCallback(callback => mail.send(message, callback))
      .catch((err) => {
        console.log(err);
      });

  }
};

