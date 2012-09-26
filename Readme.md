# Axon

  Axon is a message-oriented socket library for node.js heavily inspired by zeromq.

## Installation

    $ npm install axon

## Features

  - message oriented
  - automated reconnection
  - light-weight wire protocol
  - supports arbitrary binary message (msgpack, json, BLOBS, etc)
  - supports JSON messages out of the box

## Patterns

  - push / pull
  - pub / sub
  - emitter
  - req / rep
  - router
  - dealer

## Push / Pull

`PushSocket`s distribute messages round-robin:

```js
var axon = require('axon')
  , sock = axon.socket('push');

sock.bind(3000);
console.log('push server started');

setInterval(function(){
  sock.send('hello');
}, 150);
```

Receiver of `PushSocket` messages:

```js
var axon = require('axon')
  , sock = axon.socket('pull');

sock.connect(3000);

sock.on('message', function(msg){
  console.log(msg.toString());
});
```

Both `PushSocket`s and `PullSocket`s may `.bind()` or `.connect()`. In the
following configuration the push socket is bound and pull "workers" connect
to it to receive work:

![push bind](http://f.cl.ly/items/473u3m1a0k1i0J0I3s04/ss-push.png)

This configuration shows the inverse, where workers connect to a "sink"
to push results:

![pull bind](http://f.cl.ly/items/3Y0j2v153Q0l1r373i0H/ss-pull.png)

## Pub / Sub

`PubSocket`s send messages to all subscribers without queueing. This is an
important difference when compared to a `PushSocket`, where the delivery of
messages will be queued during disconnects and sent again upon the next connection.

```js
var axon = require('axon')
  , sock = axon.socket('pub');

sock.bind(3000);
console.log('pub server started');

setInterval(function(){
  sock.send('hello');
}, 500);
```

`SubSocket` simply recieves any messages from a `PubSocket`:

```js
var axon = require('axon')
  , sock = axon.socket('sub');

sock.connect(3000);

sock.on('message', function(msg){
  console.log(msg.toString());
});
```

## EmitterSocket

`EmitterSocket`'s send and receive messages behaving like regular node `EventEmitter`s.
This is achieved by using pub / sub sockets behind the scenes and automatically formatting
messages with the "json" codec. Currently we simply define the `EmitterSocket` as a `PubSocket` if you `.bind()`, and `SubSocket` if you `.connect()`, providing the natural API you're used to:

server.js:

```js
var axon = require('axon')
  , sock = axon.socket('emitter');

sock.bind(3000);
console.log('pub server started');

setInterval(function(){
  sock.emit('login', { name: 'tobi' });
}, 500);
```

client.js:

```js
var axon = require('axon')
  , sock = axon.socket('emitter');

sock.connect(3000);
console.log('sub client connected');

sock.on('login', function(user){
  console.log('%s signed in', user.name);
});
```

## Req / Rep

`ReqSocket`s send and receive messages, queueing messages on remote disconnects. There
is no "lock step" involved, allowing messages sent later to receive replies prior to
previously sent messages. `RepSocket`s reply to received messages, there is no concept of `send()`. Each
received message will have a `reply` callback, which will send the response back to the remote peer:

client.js
```js
var axon = require('axon')
  , sock = axon.socket('req');

sock.connect(3000);

sock.on('message', function(msg){
  console.log('got: %s', msg.toString());
});

setInterval(function(){
  sock.send('ping');
}, 150);
```

server.js
```js

var axon = require('axon')
  , sock = axon.socket('rep');

sock.bind(3000);

sock.on('message', function(msg, reply){
  console.log('got: %s', msg.toString());
  reply('pong');
});
```

## Router

`RouterSocket`s send a message to an "identified" peer using the socket's "identity"
(see `socket options`). Sent messages are not queued. The message sent leverages
multipart messages by framing the "identity" first, the delimiter second, and then
the actual message body.

__Note:__ This will probably change due to the awkwardness of handling your own delimiters.

client.js
```js
var axon = require('axon')
  , sock = axon.socket('router');

sock.bind(3000);

sock.on('message', function(from, delim, msg){
  console.log(msg.toString());
});

setInterval(function(){
  sock.send('foo', '\u0000', 'hello foo');
  sock.send('bar', '\u0000', 'hello bar');
}, 150);
```

server.js
```js
var axon = require('axon')
  , foo = axon.socket('rep')
  , bar = axon.socket('rep');

foo.set('identity', 'foo');
foo.connect(3000);

foo.on('message', function(msg, reply){
  reply('foo: pong');
});

bar.set('identity', 'bar');
bar.connect(3000);

bar.on('message', function(msg, reply){
  reply('bar says: pong');
});
```

## Dealer

`DealerSocket`s receive messages and round-robin sent messages. There is no
correlation between the two. They can be thought of as a `PushSocket` and `PullSocket`
combined. Here the dealer the serves as an "echo-service", sending whatever is receives:

dealer.js
```js
var axon = require('axon')
  , sock = axon.socket('dealer');

sock.set('identity', 'echo-service');
sock.connect(3000);

sock.on('message', function(msg){
  sock.send(msg);
});
```

client.js
```js
var axon = require('axon')
  , sock = axon.socket('router');

sock.bind(3000);

sock.on('message', function(from, msg){
  console.log('%s said: %s', from.toString(), msg.toString());
});

setInterval(function(){
  sock.send('echo-service', 'hey tobi');
}, 500);
```

## Socket Options

Every socket has associated options that can be configured via `get/set`.

  - `identity` - The "name" of the socket that uniqued identifies it.
  - `retry timeout` - The amount of time until retries will not be attempted again.

PubSockets additionally have options for batching:

  - `batch max` - Max amount of messages to buffer in memory.
  - `batch ttl` - Amount of time to buffer messages before sending.

## Binding / Connecting

In addition to passing a portno, binding to INADDR_ANY by default, you
may also specify the hostname via `.bind(port, host)`, another alternative
is to specify the url much like zmq via `tcp://<hostname>:<portno>`, thus
the following are equivalent:

```
sock.bind(3000)
sock.bind(3000, '0.0.0.0')
sock.bind('tcp://0.0.0.0:3000')

sock.connect(3000)
sock.connect(3000, '0.0.0.0')
sock.connect('tcp://0.0.0.0:3000')
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

Thus 5 bytes is the smallest message axon supports at the moment. Later if
necessary we can use the meta to indicate a small message and ditch octet 2 and 3
allowing for 3 byte messages.

## Codecs

To define a codec simply invoke the `axon.codec.define()` method, for example
here is the JSON codec:

```js
var axon = require('axon');

axon.codec.define('json', {
  encode: JSON.stringify,
  decode: JSON.parse
});
```

__Note:__ codecs must be defined on both the sending and receiving ends, otherwise
axon cannot properly decode the messages. You may of course ignore this
feature all together and simply pass encoded data to `.send()`.

## Performance

I haven't profiled or tuned anything yet but so far for on my macbook pro.

64 byte messages:

```

      min: 22,085 ops/s
     mean: 585,944 ops/s
   median: 606,176 ops/s
    total: 326,7126 ops in 6.5s
  through: 35.76318359375 mb/s

```

  1k messages:

```

      min: 1,851 ops/s
     mean: 34,0156 ops/s
   median: 449,660 ops/s
    total: 329,831 ops in 4.241s
  through: 332.18359375 mb/s

```

## What's it good for?

  Axon are not meant to combat zeromq nor provide feature parity,
  but provide a nice solution when you don't need the insane
  nanosecond latency or language interoperability that zeromq provides
  as axon do not rely on any third-party compiled libraries.

## Running tests

```
$ npm install
$ make test
```

## Authors

  - [visionmedia](http://github.com/visionmedia)
  - [gjohnson](https://github.com/gjohnson)

## Links

  - [Screencast](https://vimeo.com/45818408)

## Todo

  - more tests
  - code cov
  - acks
  - weighted fair queuing
  - use mocha for tests
  - cap batch size
  - zero-copy for batches...
  - make batching configurable... disable for lower latency
  - subscriptions
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

