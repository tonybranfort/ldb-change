# v3.0.0
- Change `GetDiffsOptions.compare` to also compare objects if `path` (key of `compare` object) is lowest relative path node (eg 'width' of 'a[0].board.width'.  Previously only compared when full path match (eg 'a[0].board.width')
- Expose new functions: 
  - getPathNodes
  - getDeepestPathNode
  - isPathRelativeAndDeepest

# v2.0.2
- Update package main to correctly point to dist/index.js

# v2.0.1
- No code changes.
- Remove mocha and should from package dependencies.
- Update tests to run without mocha and should

# v2.0.0
- Update to Typescript
- Remove lodash
- Breaking changes:
  - js files now in dist folder
  - `getDiffs` fn will now return diffs if comparing 2 arrays that vary in length and options stopAt is path to arrays
    - Example: `getDiffs({a:[]},{a:[{o:44}]},undefined,{stopAt:{'a':true}})` previously would have returned `[]` but now will return `[{"path":"a","lObj":[],"rObj":[{"o":44}]}]`

# v1.0.0 
- Initial release


