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

## why

The main goal is to provide lightweight and modern library for queuing tasks.
The name was inspired by the [asap](https://github.com/kriskowal/asap) library.
There is already a few libraries with the same functionalites, but this is another one.
| lib | async | sync | concurrency | browser | server | size | license |
|--- |--- |--- |--- |--- |--- |--- |--- |
| [asap-es](https://github.com/tlaziuk/asap-es) | ✓ | ✓ | ✓ | ✓ | ✓ | 2.5 kB | MIT |
| [asap](https://github.com/kriskowal/asap) | ❌ | ✓ | ❌ | ✓ | ✓ | 848 B | MIT |
| [d3-queue](https://github.com/d3/d3-queue) | ✓ | ✓ | ✓ | ✓ | ✓ | 968 B | BSD-3-Clause |
| [aurelia-task-queue](https://github.com/aurelia/task-queue) | ✓ | ✓ | ❌ | ❌ | ✓ | 968 B | BSD-3-Clause |

## installation

``` sh
npm install asap-es
```

## usage

``` typescript
import asap from "asap-es";

const queue = new asap();

queue.enqueue(() => Promise.resolve(2)).then(console.log);
// console >> 2
});
```
