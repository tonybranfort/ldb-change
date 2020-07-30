

export interface Diff {
  path: string; // path The dot notation path to the property with diff
  lObj: any;    // lObj The object or value of the left object compared
  rObj: any;    // rObj The object or value of the right object compared
}

/** optional options for getDiffs   
     stopAt: Object with paths as keys (value='true') where those paths 
       will not be descended. only to determine if there is a difference. 
     compare: compare Object with paths as keys and value a function 
       which is to be used to determine if diff a that path.
       function takes 2 parameters: lObj, rObj; should return true or false.  
       Does not descend down past this path. 
*/ 
export interface GetDiffsOptions {
  stopAt?: Object|undefined; 
  compare?: Object|undefined; 
}

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
export function getDiffs(lObj:any, rObj:any, path:string='', options:GetDiffsOptions={}) {
  let diffs:Diff[] = [];
  if(rObj === undefined) {
    makeDiff(lObj, rObj, path);
  } else if(options && options.compare && options.compare[path] && 
    _isFunction(options.compare[path])) {
    if(!options.compare[path](lObj, rObj)) {
      makeDiff(lObj, rObj, path);
    }
  } else if(
    (_isString(lObj) || _isNumber(lObj) || _isBoolean(lObj)) && 
      lObj !== rObj)  {
        makeDiff(lObj, rObj, path);
  } else if(_isDate(lObj) && _isDate(rObj)) {
    if(lObj.valueOf() !== rObj.valueOf()) {
      makeDiff(lObj, rObj, path);
    }
  } else if(Array.isArray(lObj) && Array.isArray(rObj)) {
    let arrayHasDiff = false; 
    if(options?.stopAt && options.stopAt[path] && lObj.length !== rObj.length) {
      makeDiff(lObj, rObj, path); 
    } else {
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
    }
  } else if(_isPlainObject(lObj) && _isPlainObject(rObj)) {
    let objHasDiff = false; 
    Object.keys(lObj).forEach(key => {
      let thisPath = path ? path + '.' + key : key; 
      let value = lObj[key]; 

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

  function makeDiff(lObj:any, rObj:any, path:string) {
    diffs.push({path: path, lObj: lObj, rObj: rObj});
  }

  return diffs; 
}

export function _isFunction(obj:any) {
  return obj && typeof obj === 'function' ? true:false; 
}

export function _isString(obj:any) {
  return obj && typeof obj === 'string' ? true:false; 
}

export function _isNumber(obj:any) {
  return obj && typeof obj === 'number' ? true:false
}

export function _isBoolean(obj:any) {
  return typeof obj === 'boolean' ? true:false
}

export function _isDate(obj:any) {
  return obj && 
    _isFunction(obj.getMonth) && 
    Object.prototype.toString.call(obj) === '[object Date]' &&
    !isNaN(obj) ?  true:false;
}

export function _isPlainObject(obj:any) {
  return obj && 
    typeof obj === 'object' &&  
    !_isFunction(obj) && !_isString(obj) && !_isNumber(obj) && !_isDate(obj) &&
    obj.constructor == Object && 
    Object.prototype.toString.call(obj) === '[object Object]'; 
}
