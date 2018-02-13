# asap-es

[![build](https://img.shields.io/travis/tlaziuk/asap-es/master.svg)](https://travis-ci.org/tlaziuk/asap-es)
[![coverage](https://img.shields.io/coveralls/github/tlaziuk/asap-es/master.svg)](https://coveralls.io/github/tlaziuk/asap-es?branch=master)
[![dependencies](https://img.shields.io/david/tlaziuk/asap-es.svg)](https://david-dm.org/tlaziuk/asap-es)
[![dev-dependencies](https://img.shields.io/david/dev/tlaziuk/asap-es.svg)](https://david-dm.org/tlaziuk/asap-es?type=dev)
[![optional-dependencies](https://img.shields.io/david/optional/tlaziuk/asap-es.svg)](https://david-dm.org/tlaziuk/asap-es?type=optional)
[![peer-dependencies](https://img.shields.io/david/peer/tlaziuk/asap-es.svg)](https://david-dm.org/tlaziuk/asap-es?type=peer)
[![version](https://img.shields.io/npm/v/asap-es.svg)](https://www.npmjs.com/package/asap-es)
[![downloads](https://img.shields.io/npm/dm/asap-es.svg)](https://www.npmjs.com/package/asap-es)
[![license](https://img.shields.io/npm/l/asap-es.svg)](https://www.npmjs.com/package/asap-es)
[![maintainability](https://img.shields.io/codeclimate/maintainability/tlaziuk/asap-es.svg)](https://codeclimate.com/github/tlaziuk/asap-es)

Asynchronous function queue runner!

## installation

``` sh
npm install asap-es
```

## why

The main goal is to provide lightweight and modern library for queuing tasks.
The name was inspired by the [asap](https://github.com/kriskowal/asap) library.
There is already a few libraries with similar functionality, yet this is another one.

| lib | async | sync | concurrency | priority | size | license |
| ---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| [![asap-es](https://img.shields.io/npm/v/asap-es.svg?label=asap-es)](https://github.com/tlaziuk/asap-es) | ✔️ | ✔️ | ✔️ | ✔️ | ![size](https://img.shields.io/bundlephobia/minzip/asap-es.svg) | ![license](https://img.shields.io/npm/l/asap-es.svg) |
| [![asap](https://img.shields.io/npm/v/asap.svg?label=asap)](https://github.com/kriskowal/asap) | ✖️ | ✔️ | ✖️ | ✖️ | ![size](https://img.shields.io/bundlephobia/minzip/asap.svg) | ![license](https://img.shields.io/npm/l/asap.svg) |
| [![d3-queue](https://img.shields.io/npm/v/d3-queue.svg?label=d3-queue)](https://github.com/d3/d3-queue) | ✔️ | ✔️ | ✔️ | ✖️ | ![size](https://img.shields.io/bundlephobia/minzip/d3-queue.svg) | ![license](https://img.shields.io/npm/l/d3-queue.svg) |
| [![aurelia-task-queue](https://img.shields.io/npm/v/aurelia-task-queue.svg?label=aurelia-task-queue)](https://github.com/aurelia/task-queue) | ✔️ | ✔️ | ✖️ | ✖️ | ![size](https://img.shields.io/bundlephobia/minzip/aurelia-task-queue.svg) | ![license](https://img.shields.io/npm/l/aurelia-task-queue.svg) |
| [![kueue](https://img.shields.io/npm/v/kueue.svg?label=kueue)](https://github.com/jasonkneen/kueue) | ✔️ | ✔️ | ✖️ | ✖️ | ![size](https://img.shields.io/bundlephobia/minzip/kueue.svg) | ![license](https://img.shields.io/npm/l/kueue.svg) |
| [![queue](https://img.shields.io/npm/v/queue.svg?label=queue)](https://github.com/jessetane/queue) | ✔️ | ✔️ | ✖️ | ✔️ | ![size](https://img.shields.io/bundlephobia/minzip/queue.svg) | ![license](https://img.shields.io/npm/l/queue.svg) |
| [![run-queue](https://img.shields.io/npm/v/run-queue.svg?label=run-queue)](https://github.com/iarna/run-queue) | ✔️ | ✔️ | ✖️ | ✔️ | ![size](https://img.shields.io/bundlephobia/minzip/run-queue.svg) | ![license](https://img.shields.io/npm/l/run-queue.svg) |

## api

| name | description |
| ---: | :--- |
| `new <ctor>(c)` | create new _asap-es_ instance, optinal concurrency can be passed as argument |
| `<ctor>(c)` | same as above |
| `<instance>.c` | the number of tasks to run simultaneously (`1` by default), set to `< 1` to pause the queue |
| `<instance>.q(task, priority)` | enqueue a new _task_, returns a promise which resolves or rejects when execution of the task is finished, optionally pass _priority_ |
| _task_ | task is a function which may return a value or a promise (task awaits for promise completion) |

## usage example

``` typescript
import asap from "asap-es";
import delay from "asap-es/delay";
import timeout from "asap-es/timeout";

// you can have many independent queues
const queue = new asap();

// paused queue will not run tasks
const queuePaused = new asap(false);

// resume the queue by increasing concurrency
queuePaused.c++;

// promises
queue.q(() => Promise.resolve(2)).then(console.log);
// console >> 2

// pause the queue
queue.c = 0;

// async functions
queue.q(async () => {
    // do some async things
});

// task with higher priority
queue.q(() => void 0, -1);

// set concurrency and resume the queue
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
