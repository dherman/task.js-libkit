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

export default function Task() {
  console.log('hi I am Task');
};
