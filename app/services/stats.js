'use strict';

var _ = require( 'underscore' );
var async = require( 'async' );
var debug = require( "debug" )( "dpac:services.stats" );
var estimate = require( 'estimating-rasch-model' );

module.exports = {
  estimate: function( representations,
                      comparisons ){
    setTimeout( function(){
      try{
        estimate.estimateCJ( comparisons, representations );
      }catch(err){
        return console.log(err, err.stack);
      }
      var toRanks = _.filter( representations, function( representation ){
        return representation.rankType = "to rank";
      } );
      async.eachSeries( toRanks, function( representation,
                                           next ){
        console.log("saving:", representation._id);
        representation.save( next );
      } );
    }, 500 );
  }
};
