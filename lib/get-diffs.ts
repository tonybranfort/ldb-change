

export interface Diff {
  path: string; // path The dot notation path to the property with diff
  lObj: any;    // lObj The object or value of the left object compared
  rObj: any;    // rObj The object or value of the right object compared
}

/** optional options for getDiffs   
     stopAt: Object with paths as keys (value='true') where those paths 
       will not be descended. only to determine if there is a difference. 
     compare: compare Object with paths (absolute or lowest path node) as keys and value a function 
       which is to be used to determine if diff a that path.
       function takes 2 parameters: lObj, rObj; should return true or false.  
       Does not descend down past this path. 
*/ 
export interface GetDiffsOptions {
  stopAt?: Object|undefined; 
  compare?: {[key:string /* path */]: (lObj:any, rObj:any) => boolean}; 
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
  *   by full path: 
  *     getDiffs({a: 1}, {a: '1'}, undefined, {compare: {"a": (lObj, rObj) => lObj + '' === rObj}})
  *     getDiffs({a: {b: 1}}, {a: {b:'1'}}, undefined, {compare: {"a.b": (lObj, rObj) => lObj + '' === rObj}})
  *   or by lowest (deepest) path node: 
  *     getDiffs({a: {b: 1}}, {a: {b:'1'}}, undefined, {compare: {"b": (lObj, rObj) => lObj + '' === rObj}})
**/   
export function getDiffs(lObj:any, rObj:any, path:string='', options:GetDiffsOptions={}) {
  let diffs:Diff[] = [];
  let deepestPathNode = getDeepestPathNode(path); // eg 'width' of path 'a[0].board.width'
  let optionalCompareFn = 
    deepestPathNode && _isFunction(options?.compare?.[deepestPathNode]) ? 
      options?.compare?.[deepestPathNode] :
      _isFunction(options?.compare?.[path]) ? options?.compare?.[path] : undefined; 

  if(rObj === undefined) {
    makeDiff(lObj, rObj, path);
  } else if(optionalCompareFn) {
      // compare can be for absolute path eg ('a[0].board.width' or relative path eg 'width')
      if(!optionalCompareFn(lObj, rObj)) {
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

/** get array of individual path names given an absolute path
      eg: 'a[0].board.width' => ['a',0, 'board', 'width']
*/ 
export function getPathNodes(path:string):(string|number)[] {
  path = path ?? ''
  const nodesByDot = path.split('.') // ['a[0]', 'board', 'width']
  let nodes:(string|number)[] = [];
  nodesByDot.forEach(node => {
    if(node.endsWith(']')) {
      let reExec = /^([a-zA-Z0-9]*)\[([0-9]*)\]$/.exec(node); 
      let propName = reExec?.[1];        // 'a'
      let arrayElementNbr = reExec?.[2]; // '0'
      if(reExec && reExec.length > 2) { // [ 'a[0]', 'a', '0', index: 0, input: 'a[0]', groups: undefined ]
        if(propName) {
          nodes.push(propName); // ok if empty string - would be where node is '[0]'
        }
        nodes.push(Number(arrayElementNbr))
      } else {
        throw new Error('Unable to parse ' + node + ' for arrayElementNbr')
      }
    } else {
      nodes.push(node); 
    }
  })
  return nodes; 
} 

/** get 'lowest' relative path within an absolute path 
      eg: 'a[0].board.width' => 'width'
    returns undefined if deepest node is array element number
      eg 'a[0].boards[1]' => undefined
*/ 
export function getDeepestPathNode(path:string):string|undefined {
  const deepestNode = getPathNodes(path).splice(-1)[0]; 
  if(typeof deepestNode === 'string') {
    return deepestNode
  } 
} 

/** return true if relative path is part of and deepest part of absolute path 
    eg ('width', 'a[0].board.width') => true
    eg ('board.width', 'a[0].board.width') => true
    eg ('a[0].board.width', 'a[0].board.width') => true
    eg ('board', 'a[0].board.width') => false
*/ 
export function isPathRelativeAndDeepest(relativePath: string, absolutePath: string):boolean {
  return relativePath === absolutePath || absolutePath.endsWith('.' + relativePath)  ; 
}
  
/** return whatever is found in a given object for a given path */ 
export function getAtPath(path:string|number, obj:any) {
  if(path === '' || typeof obj !== 'object') return obj; 

  if(typeof path === 'number') return obj[path]; 

  const pathNodes = getPathNodes(path);           // ['a',0,'board','width']

  let node = pathNodes.splice(0,1)[0];  // 'a', 'board' 
  
  return getAtPath(pathNodes.length === 0 ? '' : pathNodes.join('.'), obj[node])

}
