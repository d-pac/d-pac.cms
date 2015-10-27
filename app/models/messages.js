"use strict";

var _ = require( "lodash" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;

var Message = new keystone.List( "Message", {
  map: {
    name: "_rid"
  },
  track: true,
  defaultSort: '-_rid'
} );

Message.defaultColumns = "createdBy, subject, recipientType, state";

Message.schema.plugin( require( "./helpers/autoinc" ).plugin, {
  model: "Message",
  field: "_rid",
  startAt: 1
} );

var list = require( './helpers/setupList' )( Message )
  .add( {
    recipientType: {
      type: Types.Select,
      options: [
        {
          label: 'Assessors',
          value: 'assessors'
        },
        {
          label: 'Assessees',
          value: 'assessees'
        },
        {
          label: 'Assessees & assessors',
          value: 'assessment'
        },
        {
          label: 'PAM',
          value: 'pam'
        },
        {
          label: 'Select manually',
          value: 'manual'
        }
      ],
      initial: true,
      label: 'Recipients'
    },
    assessment: {
      type: Types.Relationship,
      ref: "Assessment",
      required: false,
      dependsOn: {
        recipientType: [ 'assessors', 'assessees', 'assessment', 'pam' ]
      },
      initial: true
    },
    recipients: {
      type: Types.Relationship,
      ref: 'User',
      many: true,
      dependsOn: {
        recipientType: 'manual'
      },
      initial: true,
      label: "Users"
    },
    strategy: {
      type: Types.Select,
      options: [
        {
          label: 'Send immediately',
          value: 'send'
        },
        {
          label: 'Schedule',
          value: 'scheduled'
        },
        {
          label: 'Draft',
          value: 'draft'
        }
      ],
      default: 'draft',
      label: 'Sending strategy'
    },
    schedule: {
      type: Types.Datetime,
      label: "When",
      note: "Automatically sends message on this date and time.",
      required: false,
      dependsOn: {
        "strategy": "scheduled"
      }
    },

    subject: {
      type: Types.Text,
      default: '',
      initial: true
    },

    body: {
      type: Types.Html,
      wysiwyg: true,
      default: ''
    },

    state: {
      type: Types.Select,
      options: [
        {
          label: 'scheduled',
          value: 'scheduled'
        }, {
          label: 'sent',
          value: 'sent'
        }, {
          label: 'failed',
          value: 'failed'
        }, {
          label: 'editing',
          value: 'editing'
        }
      ],
      default: 'editing',
      noedit: true,
      hidden: true
    },

    log: {
      type: Types.Text,
      noedit: true,
      default: ''
    },
    confirm: {
      type: Boolean,
      default: false,
      dependsOn: {
        strategy: 'send'
      },
      label: 'Yes I want to send this message immediately'
    }

  } )
  .register();
