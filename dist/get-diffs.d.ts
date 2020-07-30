export interface Diff {
    path: string;
    lObj: any;
    rObj: any;
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
    stopAt?: Object | undefined;
    compare?: Object | undefined;
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
export declare function getDiffs(lObj: any, rObj: any, path?: string, options?: GetDiffsOptions): Diff[];
export declare function _isFunction(obj: any): boolean;
export declare function _isString(obj: any): boolean;
export declare function _isNumber(obj: any): boolean;
export declare function _isBoolean(obj: any): boolean;
export declare function _isDate(obj: any): boolean;
export declare function _isPlainObject(obj: any): boolean;
