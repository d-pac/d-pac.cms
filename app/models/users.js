var keystone = require( "keystone" );
var Types = keystone.Field.Types;

/**
 * Users
 * =====
 */

var User = new keystone.List( "User" );
User.defaultColumns = "name, email, isAdmin";

require( './helpers/setupList' )( User )
  .add( {
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
    assessments: {
      assessor: {
        type: Types.Relationship,
        ref: "Assessment",
        index: true,
        initial: false,
        required: false,
        many: true,
        label: "Assessor assessments"
      },
      assessee: {
        type: Types.Relationship,
        ref: "Assessment",
        index: true,
        initial: false,
        required: false,
        many: true,
        label: "Assessee assessments"
      }
    }
  }, "Permissions", {
    isAdmin: {
      type: Boolean,
      label: "Can access Keystone",
      default: false
    }
  } )
  .virtualize( {
    canAccessKeystone: function(){
      return this.isAdmin;
    }
  } )
  .retain( "password" )
  .register();
