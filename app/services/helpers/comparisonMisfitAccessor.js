'use strict';

const _ = require('lodash');

module.exports = class accessor {
  constructor(representationsById){
    this.representationsById = representationsById;
  }

  create(comparison){
    const rMap = this.representationsById;
    return {
      get a(){
        return _.get(rMap, `[${comparison.representations.a}].ability.value`, NaN);
      },
      get b(){
        return _.get(rMap, `[${comparison.representations.b}].ability.value`, NaN);
      },
      get observed(){
        if(! comparison.data.selection){
          return NaN;
        }
        return (comparison.data.selection === comparison.representations.a) ? 1 : 0;
      },
      get paths(){
        return [
          `byAssessor[${comparison.assessor}]`,
          `byRepresentation[${comparison.representations.a}]`,
          `byRepresentation[${comparison.representations.b}]`,
        ];
      }
    };
  }

};
