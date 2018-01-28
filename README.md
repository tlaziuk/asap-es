# asap-es

[![Build Status](https://travis-ci.org/tlaziuk/asap-es.svg?branch=master)](https://travis-ci.org/tlaziuk/asap-es)
[![Coverage Status](https://coveralls.io/repos/github/tlaziuk/asap-es/badge.svg?branch=master)](https://coveralls.io/github/tlaziuk/asap-es?branch=master)
[![dependencies Status](https://david-dm.org/tlaziuk/asap-es/status.svg)](https://david-dm.org/tlaziuk/asap-es)
[![devDependencies Status](https://david-dm.org/tlaziuk/asap-es/dev-status.svg)](https://david-dm.org/tlaziuk/asap-es?type=dev)
[![peerDependencies Status](https://david-dm.org/tlaziuk/asap-es/peer-status.svg)](https://david-dm.org/tlaziuk/asap-es?type=peer)
[![version](https://img.shields.io/npm/v/asap-es.svg)](https://www.npmjs.com/package/asap-es)
[![downloads](https://img.shields.io/npm/dm/asap-es.svg)](https://www.npmjs.com/package/asap-es)
[![license](https://img.shields.io/npm/l/asap-es.svg)](https://www.npmjs.com/package/asap-es)

Use all advantages of queues with promises!

## installation

``` sh
npm install asap-es
```

## why

The main goal is to provide lightweight and modern library for queuing tasks.
The name was inspired by the [asap](https://github.com/kriskowal/asap) library.
There is already a few libraries with similar functionality, yet this is another one.

| lib | async | sync | concurrency | browser | server | size | license |
| ---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| [![asap-es](https://img.shields.io/npm/v/asap-es.svg?label=asap-es)](https://github.com/tlaziuk/asap-es) | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ![size](https://img.shields.io/bundlephobia/minzip/asap-es.svg) | ![license](https://img.shields.io/npm/l/asap-es.svg) |
| [![asap](https://img.shields.io/npm/v/asap.svg?label=asap)](https://github.com/kriskowal/asap) | ✖️ | ✔️ | ✖️ | ✔️ | ✔️ | ![size](https://img.shields.io/bundlephobia/minzip/asap.svg) | ![license](https://img.shields.io/npm/l/asap.svg) |
| [![d3-queue](https://img.shields.io/npm/v/d3-queue.svg?label=d3-queue)](https://github.com/d3/d3-queue) | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ![size](https://img.shields.io/bundlephobia/minzip/d3-queue.svg) | ![license](https://img.shields.io/npm/l/d3-queue.svg) |
| [![aurelia-task-queue](https://img.shields.io/npm/v/aurelia-task-queue.svg?label=aurelia-task-queue)](https://github.com/aurelia/task-queue) | ✔️ | ✔️ | ✖️ | ✖️ | ✔️ | ![size](https://img.shields.io/bundlephobia/minzip/aurelia-task-queue.svg) | ![license](https://img.shields.io/npm/l/aurelia-task-queue.svg) |
| [![kueue](https://img.shields.io/npm/v/kueue.svg?label=kueue)](https://github.com/jasonkneen/kueue) | ✔️ | ✔️ | ✖️ | ✔️ | ✔️ | ![size](https://img.shields.io/bundlephobia/minzip/kueue.svg) | ![license](https://img.shields.io/npm/l/kueue.svg) |

## api

| name | description |
| ---: | :--- |
| `ASAP.prototype.c` | the number of tasks to run simultaneously (1 by default) |
| `ASAP.prototype.q(task)` | enqueue new task, returns a promise which resolves or rejects when execution of the task is finished |
| _task_ | task is a function which may return a value or a promise (task awaits for promise completion) |

## usage example

``` typescript
import asap from "asap-es";
import delay from "asap-es/delay";
import timeout from "asap-es/timeout";

// you can have many independent queues
const queue = new asap();

// promises
queue.q(() => Promise.resolve(2)).then(console.log);
// console >> 2

// async functions
queue.q(async () => {
    // do some async things
});

// set concurrency
queue.c = 2;

// delay execution of a task by 20 ms
queue.q(delay(20, () => void 0));

// handle errors
queue.q(() => {
    throw new Error();
}).catch(console.error);
// console >> error

// timeout a task after given time
queue.q(timeout(200, () => {
    // a long task
}));

// combine delay and timeout
queue.q(delay(10, timeout(5, () => {
    // this task waits 10 ms for execution, then timeouts in 5 ms
})))
```
