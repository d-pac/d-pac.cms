var keystone = require( 'keystone' ),
  async = require( 'async' ),
  Phase = keystone.list( 'Phase' );

var phases = [
  { value : "select", label : "Select best" },
  { value : "selectionSEQ", label : "Selection SEQ" },
  { value : "compare", label : "Provide comparative Feedback" },
  { value : "comparisonSEQ", label : "Comparative Feedback SEQ" },
  { value : "passfail", label : "Indicate Pass/Fail" },
  { value : "passfailSEQ", label : "Pass/Fail SEQ" }
];

function createPhase( phase,
                      done ){

  var doc = new Phase.model( phase );
  doc.save( function( err ){
    if( err ){
      console.error( "Error adding phase " + phase.label + " to the database:" );
      console.error( err );
    }else{
      console.log( "Added phase " + phase.label + " to the database." );
    }
    done();
  } );

}

exports = module.exports = function( done ){
  async.forEach( phases, createPhase, done );
};
