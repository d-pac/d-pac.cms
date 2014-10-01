'use strict';

var keystone = require( 'keystone' ),
  async = require( 'async' );
var mongoose = require( 'mongoose' );
var _ = require( 'underscore' );
var User = keystone.list( 'User' );
var Persona = keystone.list( 'Persona' );
var Assessment = keystone.list( 'Assessment' );

var users = [
  { _id      : "54295e94a872c280a49c747f",
    email    : 'assessee1@d-pac.be',
    password : 'test',
    name     : { first : 'Assessee1', last : 'D-pac' }
  },
  { _id      : "54295ee9a872c280a49c7483",
    email    : 'assessee2@d-pac.be',
    password : 'test',
    name     : { first : 'Assessee2', last : 'D-pac' }
  }
];

var assessment = [
  {
    _id         : "5423f89677177065a0887ba1",
    title       : "Test assessment",
    state       : "published",
    description : "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
    phases      : []
  }
];

var personas = [
  { role : "Assessee", user : "54295e94a872c280a49c747f", assessment : "5423f89677177065a0887ba1" },
  { role : "Assessee", user : "54295ee9a872c280a49c7483", assessment : "5423f89677177065a0887ba1" }
];

function findAdmin(){
  return User.model
    .findOne({ email:"user@keystonejs.com"})
    .exec();
}

function createAssessment(){
  return Assessment.model
    .create( assessment );
}

function createUsers(){
  return User.model
    .create( users );
}

function createPersonas(admin){
  console.log(admin);
  personas.push(  { role : "Assessor", user : admin._id, assessment : "5423f89677177065a0887ba1" } );
  return Persona.model
    .create( personas );
}

exports = module.exports = function( done ){
  var promise = createAssessment()
    .then( function(){
      return createUsers();
    } )
    .then(function(){
      return findAdmin();
    })
    .then( function(admin){
      return createPersonas(admin);
    } )
    .then( function(){
      console.log('Added test assessment, user and personas. Don\'t forget to add phases to the assessment and representations for each assessee persona!');
      done();
    } );
};

