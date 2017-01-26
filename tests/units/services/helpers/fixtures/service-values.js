'use strict';
const _ = require( 'lodash' );
const users = {
  "name as an object": {
    _id: "5888911528ad9f0569dc8159",
    name: {
      first: "First",
      last: "Last"
    },
    isAdmin: false
  },
  "flattened name":{
    "name.first": "flattened",
    isAdmin: true
  }
};
users.list = _.shuffle(_.values( users ));

module.exports = {
  users: users
};
