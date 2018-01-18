# asap-es

[![Build Status](https://travis-ci.org/tlaziuk/asap-es.svg?branch=master)](https://travis-ci.org/tlaziuk/asap-es)
[![Coverage Status](https://coveralls.io/repos/github/tlaziuk/asap-es/badge.svg?branch=master)](https://coveralls.io/github/tlaziuk/asap-es?branch=master)
[![dependencies Status](https://david-dm.org/tlaziuk/asap-es/status.svg)](https://david-dm.org/tlaziuk/asap-es)
[![devDependencies Status](https://david-dm.org/tlaziuk/asap-es/dev-status.svg)](https://david-dm.org/tlaziuk/asap-es?type=dev)
[![peerDependencies Status](https://david-dm.org/tlaziuk/asap-es/peer-status.svg)](https://david-dm.org/tlaziuk/asap-es?type=peer)
[![npm version](https://badge.fury.io/js/asap-es.svg)](https://badge.fury.io/js/asap-es)
[![downloads](https://img.shields.io/npm/dm/asap-es.svg)](https://www.npmjs.com/package/asap-es)
[![license](https://img.shields.io/npm/l/asap-es.svg)](https://www.npmjs.com/package/asap-es)

use all advantages of queues with promises!

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