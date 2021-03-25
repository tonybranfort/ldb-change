"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiffsAtPath = exports.getAtPath = exports.isPathRelativeAndDeepest = exports.getDeepestPathNode = exports.getPathNodes = exports._isPlainObject = exports._isDate = exports._isBoolean = exports._isNumber = exports._isString = exports._isFunction = exports.getDiffs = void 0;
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
function getDiffs(lObj, rObj, path = '', options = {}) {
    var _a, _b, _c, _d;
    let diffs = [];
    let deepestPathNode = getDeepestPathNode(path); // eg 'width' of path 'a[0].board.width'
    let optionalCompareFn = deepestPathNode && _isFunction((_a = options === null || options === void 0 ? void 0 : options.compare) === null || _a === void 0 ? void 0 : _a[deepestPathNode]) ? (_b = options === null || options === void 0 ? void 0 : options.compare) === null || _b === void 0 ? void 0 : _b[deepestPathNode] :
        _isFunction((_c = options === null || options === void 0 ? void 0 : options.compare) === null || _c === void 0 ? void 0 : _c[path]) ? (_d = options === null || options === void 0 ? void 0 : options.compare) === null || _d === void 0 ? void 0 : _d[path] : undefined;
    if (optionalCompareFn) {
        // compare can be for absolute path eg ('a[0].board.width' or relative path eg 'width')
        if (!optionalCompareFn(lObj, rObj)) {
            makeDiff(lObj, rObj, path);
        }
    }
    else if (rObj === undefined) {
        makeDiff(lObj, rObj, path);
    }
    else if ((_isString(lObj) || _isNumber(lObj) || _isBoolean(lObj)) &&
        lObj !== rObj) {
        makeDiff(lObj, rObj, path);
    }
    else if (_isDate(lObj) && _isDate(rObj)) {
        if (lObj.valueOf() !== rObj.valueOf()) {
            makeDiff(lObj, rObj, path);
        }
    }
    else if (Array.isArray(lObj) && Array.isArray(rObj)) {
        let arrayHasDiff = false;
        if ((options === null || options === void 0 ? void 0 : options.stopAt) && options.stopAt[path] && lObj.length !== rObj.length) {
            makeDiff(lObj, rObj, path);
        }
        else {
            lObj.forEach((el, idx) => {
                // if options.stopAt[path], then just return the current rObj, rObj as diff 
                //    and don't check any more on this object
                if (arrayHasDiff && options.stopAt && options.stopAt[path]) {
                    // don't check anything else
                }
                else {
                    let thisDiffs = getDiffs(el, rObj[idx] || undefined, path + '[' + idx + ']', options);
                    if (options.stopAt && options.stopAt[path] && thisDiffs.length > 0) {
                        arrayHasDiff = true;
                        makeDiff(lObj, rObj, path);
                    }
                    else {
                        diffs = diffs.concat(thisDiffs);
                    }
                }
            });
        }
    }
    else if (_isPlainObject(lObj) && _isPlainObject(rObj)) {
        let objHasDiff = false;
        Object.keys(lObj).forEach(key => {
            let thisPath = path ? path + '.' + key : key;
            let value = lObj[key];
            // if options.stopAt[path], then just return the current rObj, rObj as diff 
            //    and don't check any more on this object
            if (objHasDiff && options.stopAt && options.stopAt[path]) {
                // don't check anything else
            }
            else {
                let thisDiffs = getDiffs(value, rObj[key], thisPath, options);
                if (options.stopAt && options.stopAt[path] && thisDiffs.length > 0) {
                    objHasDiff = true;
                    makeDiff(lObj, rObj, path);
                }
                else {
                    diffs = diffs.concat(thisDiffs);
                }
            }
        });
    }
    else if (lObj !== rObj) {
        makeDiff(lObj, rObj, path);
    }
    function makeDiff(lObj, rObj, path) {
        diffs.push({ path: path, lObj: lObj, rObj: rObj });
    }
    return diffs;
}
exports.getDiffs = getDiffs;
function _isFunction(obj) {
    return obj && typeof obj === 'function' ? true : false;
}
exports._isFunction = _isFunction;
function _isString(obj) {
    return obj && typeof obj === 'string' ? true : false;
}
exports._isString = _isString;
function _isNumber(obj) {
    return obj && typeof obj === 'number' ? true : false;
}
exports._isNumber = _isNumber;
function _isBoolean(obj) {
    return typeof obj === 'boolean' ? true : false;
}
exports._isBoolean = _isBoolean;
function _isDate(obj) {
    return obj &&
        _isFunction(obj.getMonth) &&
        Object.prototype.toString.call(obj) === '[object Date]' &&
        !isNaN(obj) ? true : false;
}
exports._isDate = _isDate;
function _isPlainObject(obj) {
    return obj &&
        typeof obj === 'object' &&
        !_isFunction(obj) && !_isString(obj) && !_isNumber(obj) && !_isDate(obj) &&
        obj.constructor == Object &&
        Object.prototype.toString.call(obj) === '[object Object]';
}
exports._isPlainObject = _isPlainObject;
/** get array of individual path names given an absolute path
      eg: 'a[0].board.width' => ['a',0, 'board', 'width']
*/
function getPathNodes(path) {
    path = path !== null && path !== void 0 ? path : '';
    const nodesByDot = path.split('.'); // ['a[0]', 'board', 'width']
    let nodes = [];
    nodesByDot.forEach(node => {
        if (node.endsWith(']')) {
            let reExec = /^([a-zA-Z0-9]*)\[([0-9]*)\]$/.exec(node);
            let propName = reExec === null || reExec === void 0 ? void 0 : reExec[1]; // 'a'
            let arrayElementNbr = reExec === null || reExec === void 0 ? void 0 : reExec[2]; // '0'
            if (reExec && reExec.length > 2) { // [ 'a[0]', 'a', '0', index: 0, input: 'a[0]', groups: undefined ]
                if (propName) {
                    nodes.push(propName); // ok if empty string - would be where node is '[0]'
                }
                nodes.push(Number(arrayElementNbr));
            }
            else {
                throw new Error('Unable to parse ' + node + ' for arrayElementNbr');
            }
        }
        else {
            nodes.push(node);
        }
    });
    return nodes;
}
exports.getPathNodes = getPathNodes;
/** get 'lowest' relative path within an absolute path
      eg: 'a[0].board.width' => 'width'
    returns undefined if deepest node is array element number
      eg 'a[0].boards[1]' => undefined
*/
function getDeepestPathNode(path) {
    const deepestNode = getPathNodes(path).splice(-1)[0];
    if (typeof deepestNode === 'string') {
        return deepestNode;
    }
}
exports.getDeepestPathNode = getDeepestPathNode;
/** return true if relative path is part of and deepest part of absolute path
    eg ('width', 'a[0].board.width') => true
    eg ('board.width', 'a[0].board.width') => true
    eg ('a[0].board.width', 'a[0].board.width') => true
    eg ('board', 'a[0].board.width') => false
*/
function isPathRelativeAndDeepest(relativePath, absolutePath) {
    return relativePath === absolutePath || absolutePath.endsWith('.' + relativePath);
}
exports.isPathRelativeAndDeepest = isPathRelativeAndDeepest;
/** return whatever is found in a given object for a given path */
function getAtPath(path, obj) {
    if (path === '' || typeof obj !== 'object')
        return obj;
    if (typeof path === 'number')
        return obj[path];
    const pathNodes = getPathNodes(path); // ['a',0,'board','width']
    let node = pathNodes.splice(0, 1)[0]; // 'a', 'board' 
    return getAtPath(pathNodes.length === 0 ? '' : pathNodes.join('.'), obj[node]);
}
exports.getAtPath = getAtPath;
/** return the diffs that are at a given path
      and return those diffs with updated paths relative to the diffs returned
      ex: ([0],[{path:[0].caseStatus, lObj:..., rObj:...}]) => [{path:caseStatus, lObj:..., rObj:...}]*/
function getDiffsAtPath(pathIn, diffs) {
    const path = typeof pathIn === 'number' ? '[' + pathIn + ']' : pathIn;
    return diffs
        .filter(d => {
        return d.path.startsWith(path + '.') ||
            d.path.startsWith(path + '[') ||
            d.path === path;
    })
        .map(d => {
        let newPath = d.path.substring(path.length);
        newPath = newPath.substring(0, 1) === '.' ? newPath.substring(1) : newPath;
        // let newPath = d.path.replace(new RegExp('^' + path + '\\.?'), ''); 
        return { ...d, path: newPath };
    });
}
exports.getDiffsAtPath = getDiffsAtPath;
//# sourceMappingURL=get-diffs.js.map