/** tests for get-diffs
**/ 
"use strict"; 

const assert = require('assert').strict; 

let {getDiffs}  = require('../dist');

let nTests = 0; 
let nTestsSuccess = 0; 
let nTestsFail = 0; 

let tests = [
  testComparePrimatives,
  testSimpleObjects,
  testIgnoreRObjPropsNotInLObj,
  testMultiLevelObjs,
  testNestedArrays,
  testDates,
  testDifferentTypes,
  testStopAt,
  testStopAtArray,
  testStopAtArrayDiffLengths,
  testStopAtEmptyLObjArray,
  testStopAtEmptyLObjArrayNestedPath,
  testNullRObj,
  testCompareFn
]

runTests(); 

async function runTests() {
  for(const test of tests) {
    try {
      await test(); 
    } catch(e) {
      console.log(e);
    }
  }

  logResults(); 
}

function testComparePrimatives() {
  console.log('testComparePrimatives:'); 
  let test = 'should compare primitives';
  try {
    let d = getDiffs(4, 'a');
    assert.strictEqual(d.length,1);
    assert.strictEqual(d[0].path,'');
    assert.strictEqual(d[0].lObj, 4);
    assert.strictEqual(d[0].rObj, 'a');

    nTestsSuccess++; 
    console.log('   OK: ' + test);

  } catch(e) {
    nTestsFail++; 
    e.message = test + ' and should ' + e.message; 
    console.log(e); 

  }
}

function testSimpleObjects() {
  console.log('testSimpleObjects:'); 
  let test = 'should determine diffs for simple 1 level objects';
  try {
    let lo = {a: 1, b: 2, c: 5};
    let ro = {a: 2, b: 2};
    let d = getDiffs(lo, ro);
    assert.strictEqual(d.length, 2);
    assert.strictEqual(d[0].path, 'a');
    assert.strictEqual(d[0].lObj, 1);
    assert.strictEqual(d[0].rObj, 2);
    assert.strictEqual(d[1].path, 'c');
    assert.strictEqual(d[1].lObj, 5);
    assert.strictEqual((d[1].rObj === undefined), true);

    nTestsSuccess++; 
    console.log('   OK: ' + test);

  } catch(e) {
    nTestsFail++; 
    e.message = test + ' and should ' + e.message; 
    console.log(e); 

  }
}

function testIgnoreRObjPropsNotInLObj() {
  console.log('testIgnoreRObjPropsNotInLObj:'); 
  let test = 'should ignore props in rObj that are not in lObj';
  try {
    let lo = {a: 1};
    let ro = {a: 1, b: 2};
    let d = getDiffs(lo, ro);
    assert.strictEqual(d.length, 0);

    nTestsSuccess++; 
    console.log('   OK: ' + test);

  } catch(e) {
    nTestsFail++; 
    e.message = test + ' and should ' + e.message; 
    console.log(e); 

  }
}

function testMultiLevelObjs() {
  console.log('testMultiLevelObjs:'); 
  let test = 'should get diffs for multi level objects';
  try {
    let lo = {a: 1, b: {c: 2, d: 3, e: {f: 6}}};
    let ro = {a: 1, b: {c: 2, d: 5, e: {g: 6}}};
    let d = getDiffs(lo, ro);
    assert.strictEqual(d.length, 2);
    assert.strictEqual(d[0].path, 'b.d');
    assert.strictEqual(d[0].lObj, 3);
    assert.strictEqual(d[0].rObj, 5);
    assert.strictEqual(d[1].path, 'b.e.f');
    assert.strictEqual(d[1].lObj, 6);
    assert.strictEqual((d[1].rObj === undefined), true);

    nTestsSuccess++; 
    console.log('   OK: ' + test);

  } catch(e) {
    nTestsFail++; 
    e.message = test + ' and should ' + e.message; 
    console.log(e); 

  }
}

function testNestedArrays() {
  console.log('testNestedArrays:'); 
  let test = 'should get diffs for nested arrays';
  try {
    let lo = {a: 1, b: [{c: 6}, {c: 8}, {c: 10}]};
    let ro = {a: 1, b: [{c: 6}, {c: 9}]};
    let d = getDiffs(lo, ro);
    assert.strictEqual(d.length, 2);
    assert.strictEqual(d[0].path, 'b[1].c');
    assert.strictEqual(d[0].lObj, 8);
    assert.strictEqual(d[0].rObj, 9);
    assert.strictEqual(d[1].path, 'b[2]');
    assert.strictEqual(d[1].lObj.c, 10);
    assert.strictEqual((d[1].rObj === undefined), true);

    nTestsSuccess++; 
    console.log('   OK: ' + test);

  } catch(e) {
    nTestsFail++; 
    e.message = test + ' and should ' + e.message; 
    console.log(e); 

  }
}

function testDates() {
  console.log('testDates:'); 
  let test = 'should compare dates';
  try {
    let lo = {a: new Date('2017/01/01'), b: new Date('2018/01/01')};
    let ro = {a: new Date('2017/12/01'), b: new Date('2018/01/01')};
    let d = getDiffs(lo, ro);
    assert.strictEqual(d.length, 1);
    assert.strictEqual(d[0].path, 'a');
    assert.strictEqual(d[0].lObj, lo.a);
    assert.strictEqual(d[0].rObj, ro.a);

    nTestsSuccess++; 
    console.log('   OK: ' + test);

  } catch(e) {
    nTestsFail++; 
    e.message = test + ' and should ' + e.message; 
    console.log(e); 

  }
}

function testDifferentTypes() {
  console.log('testDifferentTypes:'); 
  let test = 'should compare different type';
  try {
    let lo = {a: new Date('2017/01/01'), b: new Date('2018/01/01')};
    let ro = {a: 'q', b: new Date('2018/01/01')};
    let d = getDiffs(lo, ro);
    assert.strictEqual(d.length, 1);
    assert.strictEqual(d[0].path, 'a');
    assert.strictEqual(d[0].lObj, lo.a);
    assert.strictEqual(d[0].rObj, ro.a);

    nTestsSuccess++; 
    console.log('   OK: ' + test);

  } catch(e) {
    nTestsFail++; 
    e.message = test + ' and should ' + e.message; 
    console.log(e); 

  }
}

function testStopAt() {
  console.log('testStopAt:'); 
  let test = 'should stop at a path if options indicate it';
  try {
    let lo = {a: {b: {c: 8}}};
    let ro = {a: {b: {c: 7}}};
    let d = getDiffs(lo, ro, undefined, {stopAt: {"a.b": true}});
    assert.strictEqual(d.length, 1);
    assert.strictEqual(d[0].path, 'a.b');
    assert.deepEqual(d[0].lObj, {c:8});
    assert.deepEqual(d[0].rObj, {c:7});

    nTestsSuccess++; 
    console.log('   OK: ' + test);

  } catch(e) {
    nTestsFail++; 
    e.message = test + ' and should ' + e.message; 
    console.log(e); 

  }
}

function testStopAtArray() {
  console.log('testStopAtArray:'); 
  let test = 'should stop at a path of array if options indicate it';
  try {
    let lo = {a: {b: [{c: 8}, {c:9}]}};
    let ro = {a: {b: [{c: 8}, {c:10}]}};
    let d = getDiffs(lo, ro, undefined, {stopAt: {"a.b": true}});
    // console.log(d);
    // console.log(d[0].lObj);
    // console.log(d[0].rObj);
    assert.strictEqual(d.length, 1);
    assert.strictEqual(d[0].path, 'a.b');
    assert.deepEqual(d[0].lObj, [{c: 8}, {c:9}]);
    assert.deepEqual(d[0].rObj, [{c: 8}, {c:10}]);

    nTestsSuccess++; 
    console.log('   OK: ' + test);

  } catch(e) {
    nTestsFail++; 
    e.message = test + ' and should ' + e.message; 
    console.log(e); 

  }
}

function testStopAtArrayDiffLengths() {
  console.log('testStopAtArrayDiffLengths:'); 
  let test = 'should get diffs of different array lengths with stopAt';
  try {
    let lo = {a: {b: [{c: 8}, {c:9}]}};
    let ro = {a: {b: []}};
    let d = getDiffs(lo, ro, undefined, {stopAt: {"a.b": true}});
    // console.log(d);
    // console.log(d[0].lObj);
    // console.log(d[0].rObj);
    assert.strictEqual(d.length, 1);
    assert.strictEqual(d[0].path, 'a.b');
    assert.deepEqual(d[0].lObj, [{c: 8}, {c:9}]);
    assert.deepEqual(d[0].rObj, []);

    nTestsSuccess++; 
    console.log('   OK: ' + test);

  } catch(e) {
    nTestsFail++; 
    e.message = test + ' and should ' + e.message; 
    console.log(e); 

  }
}


function testStopAtEmptyLObjArray() {
  console.log('testStopAtEmptyLObjArray:'); 
  let test = 'should get diffs when lObj array is empty with stopAt';
  try {
    let lo = {b: []};
    let ro = {b: [{c: 8}, {c:9}]};
    let d = getDiffs(lo, ro, undefined, {stopAt: {"b": true}});
    // console.log(d);
    // console.log(d[0].lObj);
    // console.log(d[0].rObj);
    assert.strictEqual(d.length, 1);
    assert.strictEqual(d[0].path, 'b');
    assert.deepEqual(d[0].lObj, []);
    assert.deepEqual(d[0].rObj, [{c: 8}, {c:9}]);

    nTestsSuccess++; 
    console.log('   OK: ' + test);

  } catch(e) {
    nTestsFail++; 
    e.message = test + ' and should ' + e.message; 
    console.log(e); 

  }
}


function testStopAtEmptyLObjArrayNestedPath() {
  console.log('testStopAtEmptyLObjArrayNestedPath:'); 
  let test = 'should get diffs when lObj array is empty with stopAt with nested path';
  try {
    let lo = {a: {b: []}};
    let ro = {a: {b: [{c: 8}, {c:9}]}};
    let d = getDiffs(lo, ro, undefined, {stopAt: {"a.b": true}});
    // console.log(d);
    // console.log(d[0].lObj);
    // console.log(d[0].rObj);
    assert.strictEqual(d.length, 1);
    assert.strictEqual(d[0].path, 'a.b');
    assert.deepEqual(d[0].lObj, []);
    assert.deepEqual(d[0].rObj, [{c: 8}, {c:9}]);

    nTestsSuccess++; 
    console.log('   OK: ' + test);

  } catch(e) {
    nTestsFail++; 
    e.message = test + ' and should ' + e.message; 
    console.log(e); 

  }
}

function testNullRObj() {
  console.log('testNullRObj:'); 
  let test = 'should return no path if rObj is null';
  try {
    let lo = {a: 1, b: {c: 1}};
    let ro ;
    let d = getDiffs(lo, ro);
    // console.log(d);
    assert.strictEqual(d.length, 1);
    assert.strictEqual(d[0].path, '');
    assert.deepEqual(d[0].lObj, {a: 1, b: {c: 1}});
    assert.strictEqual((ro === undefined), true);

    nTestsSuccess++; 
    console.log('   OK: ' + test);

  } catch(e) {
    nTestsFail++; 
    e.message = test + ' and should ' + e.message; 
    console.log(e); 

  }
}


function testCompareFn() {
  console.log('testCompareFn:'); 
  let test = 'should use an options compare';
  try {
    let lo = {a: 1, b: {z: 0, x: {y: 1}}};
    let ro = {a: 1, b: {z: 0, x: {y: '1'}}};
    let d = getDiffs(lo, ro);
    assert.strictEqual(d.length, 1);

    let options = {compare: {'b.x.y': (lObj, rObj) => lObj + '' === rObj}};
    d = getDiffs(lo, ro, undefined, options);
    assert.strictEqual(d.length, 0);

    nTestsSuccess++; 
    console.log('   OK: ' + test);

  } catch(e) {
    nTestsFail++; 
    e.message = test + ' and should ' + e.message; 
    console.log(e); 

  }
}

// }); // end of diffs describe




function logResults() {
  console.log('---------------------------------------------');
  console.log('----        nTests: ' + nTests); 
  console.log('---- nTestsSuccess: ' + nTestsSuccess); 
  console.log('----    nTestsFail: ' + nTestsFail); 
  console.log('---------------------------------------------');
}
