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
  - fast (~800 mb/s ~500,000 messages/s)

## Events

  - `close` when server or connection is closed
  - `error` (err) when an-handled socket error occurs
  - `ignored error` (err) when an axon-handled socket error occurs, but is ignored
  - `socket error` (err) emitted regardless of handling, for logging purposes
  - `reconnect attempt` when a reconnection attempt is made
  - `connect` when connected to the peer, or a peer connection is accepted
  - `disconnect` when an accepted peer disconnects
  - `bind` when the server is bound

## Patterns

  - push / pull
  - pub / sub
  - req / rep
  - pub-emitter / sub-emitter

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

`SubSocket` simply receives any messages from a `PubSocket`:

```js
var axon = require('axon')
  , sock = axon.socket('sub');

sock.connect(3000);

sock.on('message', function(msg){
  console.log(msg.toString());
});
```

 `SubSocket`s may optionally `.subscribe()` to one or more "topics" (the first multipart value),
 using string patterns or regular expressions:

```js
var axon = require('axon')
  , sock = axon.socket('sub');

sock.connect(3000);
sock.subscribe('user:login');
sock.subscribe('upload:*:progress');

sock.on('message', function(topic, msg){

});
```

## Req / Rep

`ReqSocket` is similar to a `PushSocket` in that it round-robins messages
to connected `RepSocket`s, however it differs in that this communication is
bi-directional, every `req.send()` _must_ provide a callback which is invoked
when the `RepSocket` replies.

```js
var axon = require('axon')
  , sock = axon.socket('req');

sock.bind(3000);

sock.send(img, function(res){
  
});
```

`RepSocket`s receive a `reply` callback that is used to respond to the request,
you may have several of these nodes.

```js
var axon = require('axon')
  , sock = axon.socket('rep');

sock.connect(3000);

sock.on('message', function(img, reply){
  // resize the image
  reply(img);
});
```

 Like other sockets you may provide multiple arguments or an array of arguments,
 followed by the callbacks. For example here we provide a task name of "resize"
 to facilitate multiple tasks over a single socket:

```js
var axon = require('axon')
  , sock = axon.socket('req');

sock.bind(3000);

sock.send('resize', img, function(res){
  
});
```

 Respond to the "resize" task:

```js
var axon = require('axon')
  , sock = axon.socket('rep');

sock.connect(3000);

sock.on('message', function(task, img, reply){
  switch (task.toString()) {
    case 'resize':
      // resize the image
      reply(img);
      break;
  }
});
```

## PubEmitter / SubEmitter

  `PubEmitter` and `SubEmitter` are higher-level `Pub` / `Sub` sockets, using the "json" codec to behave much like node's `EventEmitter`. When a `SubEmitter`'s `.on()` method is invoked, the event name is `.subscribe()`d for you. Each wildcard (`*`) or regexp capture group is passed to the callback along with regular message arguments.

app.js:

```js
var axon = require('axon')
  , sock = axon.socket('pub-emitter');

sock.connect(3000);

setInterval(function(){
  sock.emit('login', { name: 'tobi' });
}, 500);
```

logger.js:

```js
var axon = require('axon')
  , sock = axon.socket('sub-emitter');

sock.bind(3000);

sock.on('user:login', function(user){
  console.log('%s signed in', user.name);
});

sock.on('user:*', function(action, user){
  console.log('%s %s', user.name, action);
});

sock.on('*', function(event){
  console.log(arguments);
});
```

## Socket Options

Every socket has associated options that can be configured via `get/set`.

  - `identity` - the "name" of the socket that uniqued identifies it.
  - `retry timeout` - connection retry timeout in milliseconds [100]
  - `retry max timeout` - the cap for retry timeout length in milliseconds [5000]

PubSockets additionally have options for batching:

  - `batch max` - Max amount of messages to buffer in memory [10].
  - `batch ttl` - Amount of time in milliesconds to buffer messages before sending [100].

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

Preliminary benchmarks on my Macbook Pro:

15 byte messages:

```
      min: 280 ops/s
     mean: 472,109 ops/s
   median: 477,309 ops/s
    total: 10,758,780 ops in 24.633s
  through: 6.75 mb/s

```

64 byte messages:

```

      min: 218 ops/s
     mean: 462,286 ops/s
   median: 461,512 ops/s
    total: 6,455,160 ops in 15.488s
  through: 28.21 mb/s

```

  1k messages:

```

      min: 280 ops/s
     mean: 382,829 ops/s
   median: 382,764 ops/s
    total: 3,333,581 ops in 15.126s
  through: 373.85 mb/s

```

  8k messages:

```

      min: 392 ops/s
     mean: 92,778 ops/s
   median: 87,943 ops/s
    total: 1,257,430 ops in 21.735s
  through: 724.82 mb/s

````

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
  - [Axon RPC](https://github.com/visionmedia/axon-rpc)

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

