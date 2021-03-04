export interface Diff {
    path: string;
    lObj: any;
    rObj: any;
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
    stopAt?: Object | undefined;
    compare?: {
        [key: string]: (lObj: any, rObj: any) => boolean;
    };
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
export declare function getDiffs(lObj: any, rObj: any, path?: string, options?: GetDiffsOptions): Diff[];
export declare function _isFunction(obj: any): boolean;
export declare function _isString(obj: any): boolean;
export declare function _isNumber(obj: any): boolean;
export declare function _isBoolean(obj: any): boolean;
export declare function _isDate(obj: any): boolean;
export declare function _isPlainObject(obj: any): boolean;
/** get array of individual path names given an absolute path
      eg: 'a[0].board.width' => ['a',0, 'board', 'width']
*/
export declare function getPathNodes(path: string): (string | number)[];
/** get 'lowest' relative path within an absolute path
      eg: 'a[0].board.width' => 'width'
    returns undefined if deepest node is array element number
      eg 'a[0].boards[1]' => undefined
*/
export declare function getDeepestPathNode(path: string): string | undefined;
/** return true if relative path is part of and deepest part of absolute path
    eg ('width', 'a[0].board.width') => true
    eg ('board.width', 'a[0].board.width') => true
    eg ('a[0].board.width', 'a[0].board.width') => true
    eg ('board', 'a[0].board.width') => false
*/
export declare function isPathRelativeAndDeepest(relativePath: string, absolutePath: string): boolean;
/** return whatever is found in a given object for a given path */
export declare function getAtPath(path: string | number, obj: any): any;
/** return the diffs that are at a given path
      and return those diffs with updated paths relative to the diffs returned
      ex: ([0],[{path:[0].caseStatus, lObj:..., rObj:...}]) => [{path:caseStatus, lObj:..., rObj:...}]*/
export declare function getDiffsAtPath(pathIn: string | number, diffs: Diff[]): Diff[];
