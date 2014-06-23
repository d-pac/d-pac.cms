module.exports = function( grunt,
                           opts ){
  return {
    "options" : {
      "reporter" : require('jshint-stylish'),
      "force"    : false,
      "jshintrc" : ".jshintrc"
    },
    "all"     : [
      "routes/**/*.js",
      "models/**/*.js"
    ],
    "server"  : [
      "./keystone.js"
    ]
  };
};