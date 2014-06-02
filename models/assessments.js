'use strict';

var _ = require( 'underscore' ),
  keystone = require( 'keystone' ),
  Types = keystone.Field.Types;

var Assessment = new keystone.List( 'Assessment', {
  map     : { name : 'title' }  
} );

Assessment.add( {
  title       : {
    type     : Types.Text,
    required : true,
    initial  : true
  },
  description : {
    type    : Types.Html,
    wysiwyg : true,
    height  : 400
  },
  creator     : {
    type  : Types.Relationship,
    ref   : 'User',
    index : true
  }
} );

Assessment.relationship({
  //"field" name in _this_ model
  path: 'personas', 
  //_other_ model name
  ref:'Persona',
  //relationship field in _other_ model
  refPath:'assessment',
  //label to be used in Admin GUI
  label:'Participants'
});

Assessment.defaultColumns = 'title, creator';
Assessment.register();

