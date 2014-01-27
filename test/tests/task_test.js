import spawn from 'task';
import asap from 'rsvp/asap';
import { Promise } from 'rsvp';

function sleep(n) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve();
    }, n);
  });
}

function fail(x) {
  return new Promise(function(resolve, reject) {
    reject(x);
  });
}

describe('spawn', function() {
  it('should complete a simple task', function(done) {
    spawn(function*() {
      yield sleep(10);
      done();
    });
  });

  it('should not start running a task in this turn', function() {
    assert(!spawn(function*(){}).isRunning());
  });
});

describe('tasks', function() {
  it('should bind themselves to `this`', function(done) {
    var task = spawn(function*() {
      assert(this === task);
      done();
    });
  });

  it('should report as running and not done during execution', function(done) {
    spawn(function*() {
      assert(this.isRunning());
      assert(!this.isDone());
      done();
    });
  });

  it('should report as running and not done during execution, even from helper functions', function(done) {
    function assertStatus(task) {
      assert(task.isRunning());
      assert(!task.isDone());
    }

    spawn(function*() {
      assertStatus(this);
      done();
    });
  });

  it('should report as not running and done after completion', function(done) {
    var task = spawn(function*() {
      yield sleep(10);
    });
    task.result.then(function() {
      assert(!task.isRunning());
      assert(task.isDone());
      done();
    });
  });

});

describe('sequencing', function() {
  it('should block in between yielding promises', function(done) {
    var counter = 0;

    function updateAndSleep() {
      counter++;
      return sleep(10);
    }

    spawn(function*() {
      var a = counter;
      yield updateAndSleep();
      var b = counter;
      yield updateAndSleep();
      var c = counter;
      yield updateAndSleep();
      assert(a === 0);
      assert(b === 1);
      assert(c === 2);
      done();
    });
  });
});

describe('result', function() {
  it('should resolve to return value', function(done) {
    var task = spawn(function*() {
      yield sleep(10);
      yield sleep(10);
      return 42;
    });
    task.result.then(function(x) {
      assert(x === 42);
      done();
    });
  });

  it('should be undefined for empty tasks', function(done) {
    spawn(function*(){}).result.then(function(x) {
      assert(x === undefined);
      done();
    });
  });
});

describe('exceptions', function() {
  it('should propagate up from failure', function(done) {
    spawn(function*() {
      try {
        yield fail(17);
      } catch (e) {
        assert(e === 17);
        done();
      }
    });
  });

  it('should propagate out of tasks as rejected result', function(done) {
    spawn(function*() {
      throw "uncaught!";
    }).result.then(function() {
      assert.fail("result promise succeeded");
    }, function() {
      done();
    });
  });
});
