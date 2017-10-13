const _ = require('lodash');

module.exports = {
  getDiffs: getDiffs
};

/**
  @typedef {Object} Diff
  @param {String} path The dot notation path to the property with diff
  @param {Any} lObj The object or value of the left object compared
  @param {Any} rObj The object or value of the right object compared
**/  

/**
  @typedef {Object} GetDiffsOptions
  @param {Object|undefined} stopAt Object with paths as keys (value='true') where those paths will not be descended; only to determine if there is a difference
  @param {Object|undefined} compare Object with paths as keys and value a function which is to be used to determine if diff a that path; function takes 2 parameters: lObj, rObj; should return true or false.  Does not descend down past this path. 
**/ 

/** Return an array of paths from an object (`lObj`) that don't match another object (`rObj`) and the values of each.  
  *   Equality comparisons include String, Number, Boolean, Date or set custom comparison with options.compare by path
  *   Each element or key in an Array or literal/plain Object is evaluated (unless options.stopAt set for path)
  * @param {Any} lObj
  * @param {Any} rObj
  * @param {String|undefined} path Path to object attribute in dot notation 
  * @param {GetDiffsOptions|undefined}
  * @returns {Array<Diff>}
  * @example
  *   // returns [{path: 'a', lObj: 3, rObj: undefined}]
  *  getDiffs({a: 5}, {c: 22})
  * @example
  *   // returns [{path: 'a.b', lObj: 3, rObj: 5}, ]
  *   getDiffs({a: {b: 3}}, {a: {b: 5}})
  * @example
  *   // returns [{path: 'a[0].b.c', lObj: 5, rObj: 7}, ]
  *   getDiffs({a: [{b: {c: 5}}]}, {a: [{b: {c: 7}}]})
  * @example
  *   // returns [{path: 'a.b', lObj: {c: 8}, rObj: {c: 7}}, ]
  *   getDiffs({a: {b: {c: 8}}}, {a: {b: {c: 7}}}, undefined, {stopAt: {"a.b": true}})
  * @example
  *   // returns []  (no Diffs because of compare function at a path )
  *   getDiffs({a: 1}, {a: '1'}, undefined, {compare: {"a": (lObj, rObj) => lObj + '' === rObj}})
**/   
function getDiffs(lObj, rObj, path='', options={}) {
  let diffs = [];
  if(rObj === undefined) {
    makeDiff(lObj, rObj, path);
  } else if(options && options.compare && options.compare[path] && 
    _.isFunction(options.compare[path])) {
    if(!options.compare[path](lObj, rObj)) {
      makeDiff(lObj, rObj, path);
    }
  } else if(
    (_.isString(lObj) || _.isNumber(lObj) || _.isBoolean(lObj)) && 
      lObj !== rObj)  {
        makeDiff(lObj, rObj, path);
  } else if(_.isDate(lObj) && _.isDate(rObj)) {
    if(lObj.valueOf() !== rObj.valueOf()) {
      makeDiff(lObj, rObj, path);
    }
  } else if(_.isArray(lObj) && _.isArray(rObj)) {
    let arrayHasDiff = false; 
    lObj.forEach((el, idx) => {
      // if options.stopAt[path], then just return the current rObj, rObj as diff 
      //    and don't check any more on this object
      if(arrayHasDiff && options.stopAt && options.stopAt[path]) {
        // don't check anything else
      } else {
        let thisDiffs = 
          getDiffs(el, rObj[idx] || undefined, path + '[' + idx + ']', options);
        if(options.stopAt && options.stopAt[path] && thisDiffs.length > 0) {
          arrayHasDiff = true; 
          makeDiff(lObj, rObj, path);
        } else {
          diffs = diffs.concat(thisDiffs);
        }
      }
    });
  } else if(_.isPlainObject(lObj) && _.isPlainObject(rObj)) {
    let objHasDiff = false; 
    _.forOwn(lObj, (value, key) => {
      let thisPath = path ? path + '.' + key : key; 

      // if options.stopAt[path], then just return the current rObj, rObj as diff 
      //    and don't check any more on this object
      if(objHasDiff && options.stopAt && options.stopAt[path]) {
        // don't check anything else
      } else {
        let thisDiffs = getDiffs(value, rObj[key], thisPath, options);
        if(options.stopAt && options.stopAt[path] && thisDiffs.length > 0) {
          objHasDiff = true; 
          makeDiff(lObj, rObj, path);
        } else {
          diffs = diffs.concat(thisDiffs);
        }
      }
    });
  } else if (lObj !== rObj) {
    makeDiff(lObj, rObj, path);
  }

  function makeDiff(lObj, rObj, path) {
    diffs.push({path: path, lObj: lObj, rObj: rObj});
  }

  return diffs; 
}
