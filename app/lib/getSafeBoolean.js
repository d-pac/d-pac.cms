'use strict';

module.exports = function getSafeBoolean(value) {
  if(!value){
    return false;
  }

  if( typeof value === 'string'){
    const vlc = value.toLowerCase();
    switch (vlc){
      case "true":
      case "1":
        return true;
      default:
        return false;
    }
  }

  switch (value){
    default:
    case true:
    case 1:
      return true;
  }
};
