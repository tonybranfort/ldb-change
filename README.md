# ldb-change
Basic comparison of object literals and arrays to get differences by path

## Functions

<dl>
<dt><a href="#getDiffs">getDiffs(lObj, rObj, path, options)</a> ⇒ <code><a href="#Diff">Array.&lt;Diff&gt;</a></code></dt>
<dd><p>Return an array of paths from an object (<code>lObj</code>) that don&#39;t match another object (<code>rObj</code>) and the values of each.<br>  Equality comparisons include String, Number, Boolean, Date or set custom comparison with options.compare by path
  Each element or key in an Array or literal/plain Object is evaluated (unless options.stopAt set for path)</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Diff">Diff</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#GetDiffsOptions">GetDiffsOptions</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="getDiffs"></a>

## getDiffs(lObj, rObj, path, options) ⇒ [<code>Array.&lt;Diff&gt;</code>](#Diff)
Return an array of paths from an object (`lObj`) that don't match another object (`rObj`) and the values of each.  
  Equality comparisons include String, Number, Boolean, Date or set custom comparison with options.compare by path
  Each element or key in an Array or literal/plain Object is evaluated (unless options.stopAt set for path)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| lObj | <code>Any</code> |  |
| rObj | <code>Any</code> |  |
| path | <code>String</code> \| <code>undefined</code> | Path to object attribute in dot notation |
| options | [<code>GetDiffsOptions</code>](#GetDiffsOptions) \| <code>undefined</code> |  |

**Example**  
```js
// returns [{path: 'a', lObj: 3, rObj: undefined}]
 getDiffs({a: 5}, {c: 22})
```
**Example**  
```js
// returns [{path: 'a.b', lObj: 3, rObj: 5}, ]
  getDiffs({a: {b: 3}}, {a: {b: 5}})
```
**Example**  
```js
// returns [{path: 'a[0].b.c', lObj: 5, rObj: 7}, ]
  getDiffs({a: [{b: {c: 5}}]}, {a: [{b: {c: 7}}]})
```
**Example**  
```js
// returns [{path: 'a.b', lObj: {c: 8}, rObj: {c: 7}}, ]
  getDiffs({a: {b: {c: 8}}}, {a: {b: {c: 7}}}, undefined, {stopAt: {"a.b": true}})
```
**Example**  
```js
// returns []  (no Diffs because of compare function at a path )
  getDiffs({a: 1}, {a: '1'}, undefined, {compare: {"a": (lObj, rObj) => lObj + '' === rObj}})
```
<a name="Diff"></a>

## Diff : <code>Object</code>
**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>String</code> | The dot notation path to the property with diff |
| lObj | <code>Any</code> | The object or value of the left object compared |
| rObj | <code>Any</code> | The object or value of the right object compared |

<a name="GetDiffsOptions"></a>

## GetDiffsOptions : <code>Object</code>
**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| stopAt | <code>Object</code> \| <code>undefined</code> | Object with paths as keys (value='true') where those paths will not be descended; only to determine if there is a difference |
| compare | <code>Object</code> \| <code>undefined</code> | Object with paths as keys and value of a function which is to be used to determine if diff a that path; function takes 2 parameters: lObj and rObj and returns true if they match (no diff).  `path` here can either be a absolute path (eg `a[0].board.width` or a deepest path node (eg `width`) 
