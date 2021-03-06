'use strict';

const _ = require( 'lodash' );
const keystone = require( "keystone" );
const Types = keystone.Field.Types;

/**
 * Users
 * =====
 */
const User = new keystone.List( "User" );
User.defaultColumns = "name, anonymized, email, lastLogin, isAdmin";

function hasAssessmentId( arr,
                          needleId ){
  return _.some( arr, function( assessmentId ){
    return assessmentId.equals( needleId );
  } );
}

User.schema.methods.isAssessorFor = function( assessmentId ){
  return hasAssessmentId( this.assessments.assessor, assessmentId );
};

User.schema.methods.isAssesseeFor = function( assessmentId ){
  return hasAssessmentId( this.assessments.assessee, assessmentId );
};

User.schema.methods.isPamFor = function( assessmentId ){
  return hasAssessmentId( this.assessments.pam, assessmentId );
};

User.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model: "User",
  field: "_rid",
  startAt: 1
} );

if(! keystone.get('feature disable passwordresets')){
  User.schema.methods.sendResetPassword = keystone.auth.sendResetPassword;
}

User.schema.methods.sendInvite = keystone.auth.sendInvite;

require( './helpers/setupList' )( User )
  .add( {
    _rid: {
      type: Number,
      noedit: true,
      label: 'Unique number',
      note: 'Used for anonymization'
    },
    name: {
      type: Types.Name,
      required: true,
      index: true
    },
    organization: {
      type: Types.Relationship,
      ref: "Organization",
      index: true,
      initial: true
    },
    email: {
      type: Types.Email,
      initial: true,
      required: true,
      index: true
    },
    password: {
      type: Types.Password,
      initial: true,
      required: false
    },
  }, "Assessments", {
    assessments: {
      assessor: {
        type: Types.Relationship,
        ref: "Assessment",
        index: true,
        initial: true,
        required: false,
        many: true,
        label: "Assessor",
        default: []
      },
      assessee: {
        type: Types.Relationship,
        ref: "Assessment",
        index: true,
        initial: true,
        required: false,
        many: true,
        label: "Assessee",
        default: []
      },
      pam: {
        type: Types.Relationship,
        ref: "Assessment",
        index: true,
        initial: true,
        required: false,
        many: true,
        label: "PAM",
        default: []
      }
    }
  }, "Permissions", {
    isAdmin: {
      type: Boolean,
      label: "Can access Keystone",
      default: false
    }
  }, "Login", {
    lastLogin: {
      type: Types.Datetime,
      default: null,
      noedit: true
    }
  }, "Actions", {
    actions: {
      sendInviteMail: {
        type: Boolean,
        label: "(Re-)send invite",
        initial: true,
        default: false
      }
    }
  } )
  .virtualize( {
    canAccessKeystone: function(){
      return this.isAdmin;
    },
    anonymized: {
      get: function(){
        return 'user-' + _.padStart( this._rid, 5, "0" );
      },
      depends: [ "_rid" ]
    }
  } )
  .emit( 'assessments.assessor' )
  .retain( "password" )
  .relate( {
    path: "documents",
    ref: "Document",
    refPath: "owner",
    label: "Documents"
  }, {
    path: "comparisons",
    ref: "Comparison",
    refPath: "assessor",
    label: "Comparisons"
  } )
  .register();
