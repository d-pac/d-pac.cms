'use strict';


module.exports = function(validator){
  if(! validator){
    validator = function(item){
      return item;
    };
  }
  return validator;
};
