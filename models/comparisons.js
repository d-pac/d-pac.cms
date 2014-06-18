'use strict';

var keystone = require( 'keystone' ),
    Types = keystone.Field.Types;

var Comparison = new keystone.List( 'Comparison', {
  map : {
    name : 'id'
  }
} );

Comparison.add( {
  assessor            : {
    type     : Types.Relationship,
    ref      : 'User',
    index    : true,
    required : true,
    initial  : true
  },
  assessment          : {
    type     : Types.Relationship,
    ref      : 'Assessment',
    initial  : true,
    required : true,
    index    : true
  },
  comparativeFeedback : {
    type    : Types.Html,
    wysiwyg : true
  },
  logs                : {
    durations : {
      judgement      : {
        type    : Number,
        default : 0
      },
      seqJudgement   : {
        type    : Number,
        default : 0
      },
      comparative    : {
        type    : Number,
        default : 0
      },
      seqComparative : {
        type    : Number,
        default : 0
      },
      passFail       : {
        type    : Number,
        default : 0
      },
      seqPassFail    : {
        type    : Number,
        default : 0
      }
    },
    seqs      : {
      judgement   : {
        type    : Number,
        default : 0
      },
      comparative : {
        type    : Number,
        default : 0
      },
      passFail    : {
        type    : Number,
        default : 0
      }
    }
  },
  createdAt           : {
    type    : Date,
    default : Date.now,
    noedit  : true
  }
} );

Comparison.relationship( {
  path    : 'judgements',
  ref     : 'Judgement',
  refPath : 'comparison',
  label   : 'Judgements'
} );
//Comparison.schema.plugin(require('mongoose-random')(), { path: '_r' });
Comparison.defaultColumns = 'name, assessor, assessment';
Comparison.register();


