var keystone = require( 'keystone' ),
    _ = require( 'underscore' ),
    faker = require( 'faker' ),
    async = require( 'async' );

var User = keystone.list( 'User' );
var Assessment = keystone.list( 'Assessment' );
var Assessor = keystone.list( 'Assessor' );
var Assessee = keystone.list( 'Assessee' );
var Comparison = keystone.list( 'Comparison' );
var Judgement = keystone.list( 'Judgement' );
var Representation = keystone.list( 'Representation' );

var assessmentNum,
    assessorNum,
    comparisonNum,
    assesseeNum;

function createCallback( subject,
                         done,
                         doReport ){
  return function( err,
                   results ){
    if( err ){
      console.error( "Error adding", subject, "to the database:" );
      console.error( err );
    }else if( doReport ){
      console.log( "Added", subject, "to the database." );
    }
    done( err, results );
  };
}

function createUser( done ){
  var newUser = new User.model( {
    name  : {
      first : faker.Name.firstName(),
      last  : faker.Name.lastName()
    },
    email : faker.Internet.email()
  } );
  newUser.save( createCallback( 'a user', done ) );
}

function createUsers( done ){
  var n = _.random( 200, 250 );
  async.timesSeries( n, function( i,
                                  next ){
    createUser( next );
  }, createCallback( n + ' users', done, true ) );
}

function createAssessment( done ){
  var newAssessment = new Assessment.model( {
    title       : faker.Lorem.sentence(),
    description : faker.Lorem.paragraph( _.random( 1, 3 ) )
  } );
  newAssessment.save( createCallback( 'an assessment', done ) );
}

function createAssesments( done ){
  var n = assessmentNum = _.random( 2, 5 );
  async.timesSeries( n, function( i,
                                  next ){
    createAssessment( next );
  }, createCallback( n + ' assessments', done, true ) );
}

function createAssessor( done ){

  async.series( [
    function( next ){
      User.model.findRandom( next );
    },
    function( next ){
      Assessment.model.findRandom( next );
    }
  ], function( err,
               results ){
    var newAssessor = new Assessor.model( {
      user       : results[0],
      assessment : results[1]
    } );
    newAssessor.save( createCallback( 'an assessor', done ) );
  } );
}

function createJudgementForComparison(comparison, done){
  async.waterfall([
      function(next){
        Representation.model.findRandom(next);
      },
      function(representation, next){
        var newJudgement = new Judgement.model( {
          assessor       : comparison.assessor,
          assessment : comparison.assessment,
          comparison : comparison,
          representation : representation,
          individualFeedback : faker.Lorem.paragraphs( _.random(1, 3)),
          passed : !!_.random(0,1)
        } );
        newJudgement.save( next );
      }
  ], createCallback( 'a judgement', done ));
}

function createJudgementsForComparison(comparison, done){
  var n = 2;
  async.timesSeries( n, function( i,
                                  next ){
    createJudgementForComparison( comparison, next );
  }, createCallback( n + ' judgements', done, false ) );
}

function createComparisonForAssessor(assessor, done){
    var newComparison = new Comparison.model( {
      assessor       : assessor.user,
      assessment : assessor.assessment,
      comparativeFeedback : faker.Lorem.paragraphs( _.random(1,5))
    } );
    newComparison.save( createCallback( 'a comparison', done ) );
}

function createComparisonsForAssessor(assessor, done){
  var n = _.random( 0, 30 );
  async.timesSeries( n, function( i,
                                  next ){
    async.waterfall([
        function(next){
          createComparisonForAssessor( assessor, next );    
        },
        function(comparison, next){
          createJudgementsForComparison(comparison, next);
        }
    ], next);
  }, createCallback( n + ' comparisons', done, false )  );  
}

function createAssessors( done ){
  var n = assessorNum = _.random( 5, 10 ) * assessmentNum;
  async.timesSeries( n, function( i,
                                  next ){
    async.waterfall([
      createAssessor,
      function( assessor,
                next ){
        createComparisonsForAssessor( assessor, next );
      }
    ], next);
  }, createCallback( n + ' assessors', done, true ) );
}

function createAssessee( done ){
  async.series( [
    function( next ){
      User.model.findRandom( next );
    },
    function( next ){
      Assessment.model.findRandom( next );
    }
  ], function( err,
               results ){
    var newAssessee = new Assessee.model( {
      user       : results[0],
      assessment : results[1]
    } );
    newAssessee.save( createCallback( 'an assessee', done ) );
  } );
}

function createRepresentationForAssessee( assessee,
                                          done ){
  var newRepresentation = new Representation.model( {
    assessee   : assessee.user,
    assessment : assessee.assessment,
    file : {
      filename : faker.Lorem.words(1) + '.png',
      path : faker.Lorem.words(1),
      size : _.random(100, 3000),
      filetype : 'image/png'
    }
  } );
  newRepresentation.save( createCallback( 'a representation', done ) );
}

function createRepresentationsForAssessee( assessee,
                                           done ){
  var n = _.random( 0, 5 );
  async.timesSeries( n, function( i,
                                  next ){
    createRepresentationForAssessee( assessee, next );
  }, createCallback( n + ' representations', done, false ) );
}

function createAssessees( done ){
  var n = assesseeNum = _.random( 100, 150 ) * assessmentNum;
  async.timesSeries( n, function( i,
                                  next ){
    async.waterfall( [
      createAssessee,
      function( assessee,
                next ){
        createRepresentationsForAssessee( assessee, next );
      }
    ], next );
  }, createCallback( n + ' assessees', done, true ) );
}

exports = module.exports = function( done ){
  async.series( [
    createUsers,
    createAssesments,
    createAssessees,
    createAssessors
  ], done );
};
