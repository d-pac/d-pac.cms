'use strict';
var _ = require( 'underscore' );
var keystone = require( "keystone" );
var Representation = keystone.list( "Representation" );
var Comparison = keystone.list( "Comparison" );

module.exports = function( assessmentId,
                           done ){
  var comparisons;
  var representations;
  Comparison.model.find( { assessment: assessmentId } ).sort( "_rid" ).exec().then( function( list ){
    console.log( "Found comparisons:", list.length );
    return comparisons = list;
  } ).then( function(){
    return Representation.model.find( { assessment: assessmentId } ).exec();
  } ).then( function( list ){
    console.log( "Found representations:", list.length );
    return representations = list;
  } ).then( function(){
    console.log( representations );
    _.each( comparisons, function( comparison ){
      console.log( "Replaying:", comparison._rid );
      var a = _.find( representations, function( rep ){
        return rep.id == comparison.representations.a;
      } );
      var b = _.find( representations, function( rep ){
        return rep.id == comparison.representations.b;
      } );
      console.log( a.name + " vs " + b.name );
      a.compareWith( b );
    } );
    done();
  } );
};
