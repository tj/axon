
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
