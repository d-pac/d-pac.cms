'use strict';

module.exports = function extractMiddleBox( list,
                                            percent ){
  list = list || [];
  percent = percent || 30;
  const n = list.length;
  const nB = Math.round( n / 100 * percent );
  const index = Math.floor((n / 2) - (nB / 2));
  return list.slice( index, index + nB );
};
