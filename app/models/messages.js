"use strict";

var keystone = require( "keystone" );
var Types = keystone.Field.Types;
var constants = require( './helpers/constants' );

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

require( './helpers/setupList' )( Message )
  .add( {
    recipientType: {
      type: Types.Select,
      options: constants.recipientTypes.list,
      initial: true,
      label: 'Recipients'
    },
    assessment: {
      type: Types.Relationship,
      ref: "Assessment",
      required: false,
      dependsOn: {
        recipientType: [
          constants.recipientTypes.ASSESSORS.value, constants.recipientTypes.ASSESSEES.value,
          constants.recipientTypes.ASSESSMENT.value, constants.recipientTypes.PAM.value
        ]
      },
      initial: true
    },
    recipients: {
      type: Types.Relationship,
      ref: 'User',
      many: true,
      dependsOn: {
        recipientType: constants.recipientTypes.ANY.value
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
      note: "Scheduled messages are sent in discrete bulks, i.e. account for a delay of up to 30 minutes.",
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
          label: 'Scheduled',
          value: 'scheduled'
        }, {
          label: 'Processed',
          value: 'handled'
        }, {
          label: 'Editing',
          value: 'editing'
        }
      ],
      default: 'editing',
      noedit: true,
      hidden: true
    },

    log: {
      type: Types.Html,
      wysiwyg: true,
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
    },
    fromAPI: {
      type: Boolean,
      default: false,
      hidden: true
    }

  } )
  .retain( [ "recipientType", "log", "confirm", "fromAPI", "body", "strategy", "recipients" ] )
  .register();
