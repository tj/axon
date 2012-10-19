
0.4.2 / 2012-10-18 
==================

  * add 30% throughput increase for sub-emitter by removing some indirection
  * add escaping of regexp chars for `SubSocket#subscribe()`
  * fix non-multipart `SubEmitterSocket` logic

0.4.1 / 2012-10-16 
==================

  * add removal of sockets on error
  * add handling of __ECONNRESET__, __ECONNREFUSED__, and __EPIPE__. Closes #17
  * add immediate closing of sockets on `.close()`
  * fix "bind" event. Closes #53
  * fix 'close' event for server sockets
  * remove "stream" socket type for now

0.4.0 / 2012-10-12 
==================

  * add emitter wildcard support
  * add sub socket subscription support
  * add `pub-emitter`
  * add `sub-emitter`
  * perf: remove `.concat()` usage, ~10% gain
  * remove greetings

0.3.2 / 2012-10-08 
==================

  * change prefix fix to `reply()` only

0.3.1 / 2012-10-08 
==================

  * add fix for reply(undefined)

0.3.0 / 2012-10-05 
==================

  * add `Socket#address()` to help with ephemeral port binding. Closes #39
  * add default identity of __PID__. Closes #35
  * remove examples for router/dealer

0.2.0 / 2012-09-27 
==================

  * add default random `identity`
  * add `req.send()` callback support
  * remove router / dealer
  * change `ReqSocket` to round-robin send()s

0.1.0 / 2012-09-24 
==================

  * add router socket [gjohnson]
  * add dealer socket [gjohnson]
  * add req socket [gjohnson]
  * add rep socket [gjohnson]
  * add multipart support [gjohnson]
  * add `.set()` / `.get()` configuration methods
  * add tcp://hostname:port support to .bind() and .connect(). Closes #16
  * add `make bm`
  * add Batch#empty()
  * remove Socket#option()

0.0.3 / 2012-07-14 
==================

  * add resize example
  * add `debug()` instrumentation
  * add `PullSocket` bind support
  * add `Parser`
