import spawn from 'task';

describe('Task', function() {
  it('function', function() {
    assert(typeof spawn === 'function');
  });
});

describe('generator', function() {
  it('simple', function() {
    function* empty() { }
    var g = empty();
    assert(g.next().done);
  });
});
