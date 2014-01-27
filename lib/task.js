// This is an attempt at a stripped-down version of task.js, and I think should
// eventually replace the existing one. There might be a place for the one that
// allows custom scheduling policies, but I think there'd likely be more demand
// for a minimal task.js library.

// This is as of yet untested.

// Changes implemented here:
//
// - Tasks are not promises, but contain a .result property that is a promise.
// - Uses the proper ES6 iterator/generator protocol.
// - Uses RSVP for promises.
// - Uses ES6 modules.

import { Promise } from 'rsvp';
import asap from 'rsvp/asap';

var R_BLOCKED   = 0;  // waiting on a promise
var R_RESOLVED  = 1;  // ready to resume with a resolved value
var R_REJECTED  = 2;  // ready to resume with a rejected value
var R_RUNNING   = 3;  // currently executing

var counter = 0;

function Task(thunk) {
  this._tid = (++counter) & 0xffffffff;
  this._result = undefined;
  this._runState = R_RESOLVED;
  this._done = false;
  this._thread = thunk.call(this);
  var self = this;
  this.result = new Promise(function(resolve, reject) {
    self._resolve = resolve;
    self._reject = reject;
  });
}

export default function spawn(thunk) {
  var task = new Task(thunk);
  asap(function() {
    tick(task);
  });
  return task;
};

function tick(task) {
  if (task._done)
    return;

  var result = task._result,
      resolve = (task._runState === R_RESOLVED);

  task._runState = R_RUNNING;
  task._result = undefined;
  try {
    var next = resolve ? task._thread.next(result)
                       : task._thread["throw"](result);
    if (next.done) {
      var value = next.value;
      task._result = value;
      task._runState = R_RESOLVED;
      task._done = true;
      task._resolve(value);
    } else {
      task._runState = R_BLOCKED;
      next.value.then(function(value) {
        task._result = value;
        task._runState = R_RESOLVED;
        if (!task._done)
          tick(task);
      }, function(error) {
        task._result = error;
        task._runState = R_REJECTED;
        if (!task._done)
          tick(task);
      });
    }
  } catch (error) {
    task._result = error;
    task._runState = R_REJECTED;
    task._done = true;
    task._reject(error);
  }
}

var Tp = Task.prototype;

Tp.isDone = function() {
    return this._done;
};

Tp.isRunning = function() {
    return this._runState === R_RUNNING;
};

Tp.toString = function() {
    return "[object Task " + this._tid + "]";
};
