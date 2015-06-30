'use strict';

var keystone = require( 'keystone' );
var Types = keystone.Field.Types;

var Page = new keystone.List( 'Page', {
  autokey: {
    path: 'slug',
    from: 'name',
    unique: true
  }
} );

Page.defaultColumns = 'title, slug, state|20%, author, publishedDate, expose';
var fields = {
  name: {
    type: String,
    required: true,
    initial: true,
    note: "For administrative purposes only, to differentiate between pages with the same title."
  },
  title: {
    type: String,
    required: true,
    initial: true
  },
  slug: {
    type: String,
    index: true,
    unique: true,
    note: "Warning: modifying this will affect the URL it's shown on."
  },
  state: {
    type: Types.Select,
    options: 'draft, published, archived',
    default: 'draft',
    index: true
  },
  author: {
    type: Types.Relationship,
    ref: 'User',
    index: true
  },
  publishedDate: {
    type: Types.Date,
    index: true
  },
  body: {
    type: Types.Html,
    wysiwyg: true,
    height: 400
  },
  expose: {
    type: Types.Select,
    options: [
      {
        value: "api",
        label: "api"
      },
      {
        value: "cms",
        label: "cms"
      },
      {
        value: "both",
        label: "both"
      }
    ],
    default: "cms",
    label: "Allow acces in"
  }
};

require( './helpers/setupList' )( Page )
  .set('idField', 'slug')
  .add( fields )
  .retain( "_id", "name", "expose" )
  .register();
