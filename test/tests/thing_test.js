/*global describe, specify, it, assert */
import Thing from 'thing';

describe('Thing', function() {
  it('exists', function(){
    assert(Thing);
  });
});

describe('Mocha', function() {
  it('exists', function(){
    assert('describe' in global);
    console.log('flarg?');
    assert(5 >  1);
  });
});

describe('pls can haz?', function() {
  it('works asyncrorousry?', function(done) {
    process.nextTick(function() {
      console.log('doneulous');
      done();
    }/*, 50*/);
  });
});
