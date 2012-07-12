
# Super Sockets

  Super Sockets is a message-oriented socket library for node.js heavily inspired by zeromq.

## Installation

    $ npm install super-sockets

## Features

  - message oriented
  - automated reconnection
  - light-weight wire protocol
  - light-weight implementation (~300 SLOC)
  - supports arbitrary binary message (msgpack, json, BLOBS, etc)
  - supports JSON messages
  - push / pull pattern
  - pub / sub pattern
  - event emitter pattern

## Push / Pull

`PushSocket`s distribute messages round-robin:

```js
var ss = require('super-sockets')
  , sock = ss.socket('push');

sock.bind(3000);
console.log('push server started');

setInterval(function(){
  sock.send('hello');
}, 150);
```

Receiver of `PushSocket` messages:

```js
var ss = require('super-sockets')
  , sock = ss.socket('pull');

sock.connect(3000);

sock.on('message', function(msg){
  console.log(msg.toString());
});
```

## Pub / Sub

`PubSocket`s send messages to all subscribers without queueing:

```js
var ss = require('super-sockets')
  , sock = ss.socket('pub');

sock.bind(3000);
console.log('pub server started');

setInterval(function(){
  sock.send('hello');
}, 500);
```

`SubSocket` provides selective reception of messages from a `PubSocket`:

```js
var ss = require('super-sockets')
  , sock = ss.socket('sub');

sock.connect(3000);

sock.on('message', function(msg){
  console.log(msg.toString());
});
```

## EmitterSocket

`EmitterSocket`'s send and receive messages behaving like regular node `EventEmitter`s.
This is achieved by using pub / sub sockets behind the scenes, automatically assigned
the "json" codec. Currently we simply choose define the `EmitterSocket` as a `PubSocket` if you `.bind()`, and `SubSocket` if you `.connect()`, providing the natural API you're used to:

server.js:

```js
var ss = require('super-sockets')
  , sock = ss.socket('emitter');

sock.bind(3000);
console.log('pub server started');

setInterval(function(){
  sock.emit('login', { name: 'tobi' });
}, 500);
```

client.js:

```js
var ss = require('super-sockets')
  , sock = ss.socket('emitter');

sock.connect(3000);
console.log('sub client connected');

sock.on('login', function(user){
  console.log('%s signed in', user.name);
});
```

## Protocol

  The wire protocol is simple and very much zeromq-like, where `<length>` is
  a BE 24 bit unsigned integer representing a maximum length of roughly ~16mb. The `<meta>`
  data byte is currently only used to store the codec, for example "json" is simply `1`,
  in turn JSON messages received on the client end will then be automatically decoded for
  you by selecting this same codec.

```
 octet:     0      1      2      3      <length>
        +------+------+------+------+------------------...
        | meta | <length>           | data ...
        +------+------+------+------+------------------...
```

  Thus 5 bytes is the smallest message super sockets supports at the moment. Later if
  necessary we can use the meta to indicate a small message and ditch octet 2 and 3 
  allowing for 3 byte messages.

## Codecs

  To define a codec simply invoke the `ss.codec.define()` method, for example
  here is the JSON codec:

```js
var ss = require('super-sockets');

ss.codec.define('json', {
  encode: JSON.stringify,
  decode: JSON.parse
});
```

  __Note:__ codecs must be defined on both the sending and receiving ends, otherwise
  super sockets cannot properly decode the messages. You may of course ignore this
  feature all together and simply pass encoded data to `.send()`.

## Performance

  I haven't profiled or tuned anything yet but so far for a single byte message:

```

    mean: 58291 ops/s
  median: 47675 ops/s

```

## What's it good for?

  Super sockets are not meant to combat zeromq nor provide feature parity,
  but provide a nice solution when you don't need the insane
  nanosecond latency or language interoperability that zeromq provides
  as super sockets do not rely on any third-party compiled libraries.

## Running tests

```
$ npm install
$ make test
```

## Todo

  - more tests
  - code cov
  - acks
  - make socket options configurable
  - clean up queue / sock
  - benchmarks
  - emitter style on top of pubsub with multipart
  - pluggable codecs
  - weighted fair queuing
  - use mocha for tests
  - multipart frames
  - batching
  - binary support for EmitterSocket (requires multipart)
  - subscriptions
  - profiling / applying basic perf rules (pre-define members etc, measure results)
  - ...

## License 

(The MIT License)

Copyright (c) 2012 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

