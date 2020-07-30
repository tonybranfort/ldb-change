/** tests for get-diffs
**/ 

let should = require('should'); 
let {getDiffs} = require('../dist');

describe('getDiffs', () => {
  it('should compare primitives', function() {
    let d = getDiffs(4, 'a');
    d.length.should.equal(1);
    d[0].path.should.equal('');
    d[0].lObj.should.equal(4);
    d[0].rObj.should.equal('a');
  }); // end of it
  
  it('should determine diffs for simple 1 level objects', function() {
    let lo = {a: 1, b: 2, c: 5};
    let ro = {a: 2, b: 2};
    let d = getDiffs(lo, ro);
    d.length.should.equal(2);
    d[0].path.should.equal('a');
    d[0].lObj.should.equal(1);
    d[0].rObj.should.equal(2);
    d[1].path.should.equal('c');
    d[1].lObj.should.equal(5);
    (d[1].rObj === undefined).should.equal(true);
  }); // end of it

  it('should ignore props in rObj that are not in lObj', function() {
    let lo = {a: 1};
    let ro = {a: 1, b: 2};
    let d = getDiffs(lo, ro);
    d.length.should.equal(0);
  }); // end of it

  it('should get diffs for multi level objects', function() {
    let lo = {a: 1, b: {c: 2, d: 3, e: {f: 6}}};
    let ro = {a: 1, b: {c: 2, d: 5, e: {g: 6}}};
    let d = getDiffs(lo, ro);
    d.length.should.equal(2);
    d[0].path.should.equal('b.d');
    d[0].lObj.should.equal(3);
    d[0].rObj.should.equal(5);
    d[1].path.should.equal('b.e.f');
    d[1].lObj.should.equal(6);
    (d[1].rObj === undefined).should.equal(true);
  }); // end of it

  it('should get diffs for nested arrays', function() {
    let lo = {a: 1, b: [{c: 6}, {c: 8}, {c: 10}]};
    let ro = {a: 1, b: [{c: 6}, {c: 9}]};
    let d = getDiffs(lo, ro);
    d.length.should.equal(2);
    d[0].path.should.equal('b[1].c');
    d[0].lObj.should.equal(8);
    d[0].rObj.should.equal(9);
    d[1].path.should.equal('b[2]');
    d[1].lObj.c.should.equal(10);
    (d[1].rObj === undefined).should.equal(true);
  }); // end of it

  it('should compare dates', function() {
    let lo = {a: new Date('2017/01/01'), b: new Date('2018/01/01')};
    let ro = {a: new Date('2017/12/01'), b: new Date('2018/01/01')};
    let d = getDiffs(lo, ro);
    d.length.should.equal(1);
    d[0].path.should.equal('a');
    d[0].lObj.should.equal(lo.a);
    d[0].rObj.should.equal(ro.a);
  }); // end of it

  it('should compare different type', function() {
    let lo = {a: new Date('2017/01/01'), b: new Date('2018/01/01')};
    let ro = {a: 'q', b: new Date('2018/01/01')};
    let d = getDiffs(lo, ro);
    d.length.should.equal(1);
    d[0].path.should.equal('a');
    d[0].lObj.should.equal(lo.a);
    d[0].rObj.should.equal(ro.a);
  }); // end of it

  it('should stop at a path if options indicate it', function() {
    let lo = {a: {b: {c: 8}}};
    let ro = {a: {b: {c: 7}}};
    let d = getDiffs(lo, ro, undefined, {stopAt: {"a.b": true}});
    d.length.should.equal(1);
    d[0].path.should.equal('a.b');
    d[0].lObj.should.match({c:8});
    d[0].rObj.should.match({c:7});
  }); // end of it

  it('should stop at a path of array if options indicate it', function() {
    let lo = {a: {b: [{c: 8}, {c:9}]}};
    let ro = {a: {b: [{c: 8}, {c:10}]}};
    let d = getDiffs(lo, ro, undefined, {stopAt: {"a.b": true}});
    // console.log(d);
    // console.log(d[0].lObj);
    // console.log(d[0].rObj);
    d.length.should.equal(1);
    d[0].path.should.equal('a.b');
    d[0].lObj.should.match([{c: 8}, {c:9}]);
    d[0].rObj.should.match([{c: 8}, {c:10}]);
  }); // end of it

  it('should get diffs of different array lengths with stopAt', function() {
    let lo = {a: {b: [{c: 8}, {c:9}]}};
    let ro = {a: {b: []}};
    let d = getDiffs(lo, ro, undefined, {stopAt: {"a.b": true}});
    // console.log(d);
    // console.log(d[0].lObj);
    // console.log(d[0].rObj);
    d.length.should.equal(1);
    d[0].path.should.equal('a.b');
    d[0].lObj.should.match([{c: 8}, {c:9}]);
    d[0].rObj.should.match([]);
  }); // end of it

  it('should get diffs when lObj array is empty with stopAt', function() {
    let lo = {a: {b: []}};
    let ro = {a: {b: [{c: 8}, {c:9}]}};
    let d = getDiffs(lo, ro, undefined, {stopAt: {"a.b": true}});
    // console.log(d);
    // console.log(d[0].lObj);
    // console.log(d[0].rObj);
    d.length.should.equal(1);
    d[0].path.should.equal('a.b');
    d[0].lObj.should.match([]);
    d[0].rObj.should.match([{c: 8}, {c:9}]);
  }); // end of it

  it('should return no path if rObj is null', function() {
    let lo = {a: 1, b: {c: 1}};
    let ro ;
    let d = getDiffs(lo, ro);
    // console.log(d);
    d.length.should.equal(1);
    d[0].path.should.equal('');
    d[0].lObj.should.match({a: 1, b: {c: 1}});
    (ro === undefined).should.equal(true);
  }); // end of it

  it('should use an options compare', function() {
    let lo = {a: 1, b: {z: 0, x: {y: 1}}};
    let ro = {a: 1, b: {z: 0, x: {y: '1'}}};
    let d = getDiffs(lo, ro);
    d.length.should.equal(1);

    let options = {compare: {'b.x.y': (lObj, rObj) => lObj + '' === rObj}};
    d = getDiffs(lo, ro, undefined, options);
    d.length.should.equal(0);
  }); // end of it


}); // end of diffs describe


