'use strict';
var keystone = require( 'keystone' );
var _ = require( 'underscore' );
var objectId = require( 'mongoose' ).Types.ObjectId;
var fs = require( "fs" );
var csv = require( "fast-csv" );

var Comparison = keystone.list( 'Comparison' );
var Judgement = keystone.list( 'Judgement' );
var Seq = keystone.list( 'Seq' );
var Timelog = keystone.list( 'Timelog' );

var assessments = ["5458894f0138e02976448d26", "545889770138e02976448d27", "545889960138e02976448d28", "546c5c93bf406705026574bc"];

var LEFT_EMPTY = "empty";
var UNDEFINED = "N/A";
var TRUE = 1;
var FALSE = 0;
var NIL = -1;

function listComparisons( assessmentIds ){
  return Comparison.model
    .find()
    .where( 'assessment' ).in( assessmentIds )
    .populate( 'assessor' )
    .populate( "assessment" )
    .populate( "selected" )
    .populate( "phase" )
    .sort( "_rid" )
    .exec();
}

function listJudgements( comparisonIds ){
  return Judgement.model
    .find()
    .where( "comparison" ).in( comparisonIds )
    .populate( "representation" )
    .exec();
}

function listSEQS( comparisonIds ){
  return Seq.model
    .find()
    .where( "comparison" ).in( comparisonIds )
    .populate( "phase" )
    .exec();
}

function listTimelogs( comparisonIds ){
  return Timelog.model
    .find()
    .where( "comparison" ).in( comparisonIds )
    .populate( "phase" )
    .exec();
}

function extractFeedback( comparison ){
  if( comparison.comparativeFeedback ){
    return comparison.comparativeFeedback.replace( /(?:\r\n|\r|\n)/g, '\u21A9' ).replace( /"/g, "'" );
  }else{
    //either deliberately left empty
    //or comparison wasn't finished yet and the assessor wasn't able to fill it in
    switch( comparison.phase.machinename ){
      case "select-best-select":
      case "select-best-seq-seq":
      case "comparative-feedback-compare":
        return UNDEFINED;
      default :
        return LEFT_EMPTY;
    }
  }
}

exports = module.exports = function( done ){
  var comparisonsMap = {};
  var comparisonsIds = [];
  listComparisons( assessments )
    .then( function( comparisons ){
      comparisons.forEach( function( comparison ){
        var id = comparison._id.toString();
        comparisonsIds.push( id );
        comparisonsMap[id] = {
          comparison                : comparison._rid,
          assessment                : comparison.assessment.title,
          assessor                  : comparison.assessor._id.toString(),
          comparative               : extractFeedback( comparison ),
          completed                 : (comparison.completed)
            ? TRUE
            : FALSE,
          "selected representation" : (comparison.selected)
            ? comparison.selected.file.filename
            : UNDEFINED,
          "selected position"       : UNDEFINED
        };

      } );
    } )
    .then( function(){
      return listJudgements( comparisonsIds );
    } )
    .then( function( judgements ){
      judgements.forEach( function( judgement ){
        var comparison = comparisonsMap[judgement.comparison.toString()];
        var p = judgement.position;
        comparison[p + " representation"] = judgement.representation.file.filename;
        comparison[p + " passed"] = judgement.passed || UNDEFINED;
        if( comparison["selected representation"] === judgement.representation.file.filename ){
          comparison["selected position"] = p;
        }
      } );
    } )
    .then( function(){
      return listSEQS( comparisonsIds );
    } )
    .then( function( seqs ){
      seqs.forEach( function( seq ){
        var comparison = comparisonsMap[seq.comparison.toString()];
        var p = seq.phase.label;
        comparison[p] = seq.value || NIL;
      } );
    } )
    .then( function(){
      return listTimelogs( comparisonsIds );
    } )
    .then( function( timelogs ){
      timelogs.forEach( function( timelog ){
        var comparison = comparisonsMap[timelog.comparison.toString()];
        if( !comparison[timelog.phase.label + " duration"] ){
          comparison[timelog.phase.label + " duration"] = [];
        }
        comparison[timelog.phase.label + " duration"].push( timelog.duration );
      } );
    } )
    .then( function(){
      var durations = [
        "Select best duration", "Select best SEQ duration",
        "Comparative Feedback duration", "Comparative Feedback SEQ duration",
        "Pass/Fail duration", "Pass/Fail SEQ duration"
      ];
      return _.map( comparisonsMap, function( comparison ){
        var total = 0;
        durations.forEach( function( duration ){
          if( comparison[duration] ){
            comparison[duration] = comparison[duration].reduce( function( memo,
                                                                          s ){
              return ++memo;
            }, 0 );
          }else{
            comparison[duration] = 0;
          }
          total += comparison[duration];
        } );
        comparison["Total durations"] = total;
        comparison["Affected"] = (total>6) && comparison["selected representation"] !== UNDEFINED;
        return _.defaults( comparison, {
          "Select best SEQ"          : -1,
          "Pass/Fail SEQ"            : -1,
          "Comparative Feedback SEQ" : -1
        } );
      } );
    } )
    .then( function( list ){
      var ws = fs.createWriteStream( "reports/fault-comparisons-" + Date.now() + ".csv" );
      csv
        .write( list, { headers : true, quoteColumns : true } )
        .pipe( ws );
      done();
    } );
};
