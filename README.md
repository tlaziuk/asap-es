# asap-es

[![Build Status](https://travis-ci.org/tlaziuk/asap-es.svg?branch=master)](https://travis-ci.org/tlaziuk/asap-es)
[![Coverage Status](https://coveralls.io/repos/github/tlaziuk/asap-es/badge.svg?branch=master)](https://coveralls.io/github/tlaziuk/asap-es?branch=master)
[![dependencies Status](https://david-dm.org/tlaziuk/asap-es/status.svg)](https://david-dm.org/tlaziuk/asap-es)
[![devDependencies Status](https://david-dm.org/tlaziuk/asap-es/dev-status.svg)](https://david-dm.org/tlaziuk/asap-es?type=dev)
[![peerDependencies Status](https://david-dm.org/tlaziuk/asap-es/peer-status.svg)](https://david-dm.org/tlaziuk/asap-es?type=peer)
[![npm version](https://badge.fury.io/js/asap-es.svg)](https://badge.fury.io/js/asap-es)
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
| [asap-es](https://github.com/tlaziuk/asap-es) | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | 662 B | MIT |
| [asap](https://github.com/kriskowal/asap) | ✖️ | ✔️ | ✖️ | ✔️ | ✔️ | 848 B | MIT |
| [d3-queue](https://github.com/d3/d3-queue) | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | 968 B | BSD-3-Clause |
| [aurelia-task-queue](https://github.com/aurelia/task-queue) | ✔️ | ✔️ | ✖️ | ✖️ | ✔️ | 3.11 kB | MIT |
| [kueue](https://github.com/jasonkneen/kueue) | ✔️ | ✔️ | ✖️ | ✔️ | ✔️ | 555 B | Apache 2.0 |

## api

| name | description |
| ---: | :--- |
| `ASAP.prototype.c` | the number of tasks to run simultaneously (1 by default) |
| `ASAP.prototype.q(task)` | enqueue new task, returns a promise which resolves when execution of the task is finished |
| _task_ | task is a function which returns a value or a promise |

## usage

``` typescript
import asap from "asap-es";

const queue = new asap();

queue.q(() => Promise.resolve(2)).then(console.log);
// console >> 2
```
