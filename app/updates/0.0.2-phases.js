var keystone = require( 'keystone' ),
  async = require( 'async' ),
  Phase = keystone.list( 'Phase' );

var phases = [
  { _id : "5423f87677177065a0887b99", type : "select", label : "Select best" },
  { _id : "5423f87677177065a0887b9a", type : "seq", label : "Selection SEQ" },
  { _id : "5423f87677177065a0887b9b", type : "compare", label : "Provide comparative Feedback" },
  { _id : "5423f87677177065a0887b9c", type : "seq", label : "Comparative Feedback SEQ" },
  { _id : "5423f87677177065a0887b9d", type : "passfail", label : "Indicate Pass/Fail" },
  { _id : "5423f87677177065a0887b9e", type : "seq", label : "Pass/Fail SEQ" }
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
