
/**
 * Module dependencies.
 */

var Socket = require('./sock')
  , Batch = require('../batch');

/**
 * Expose `PubSocket`.
 */

module.exports = PubSocket;

/**
 * Initialize a new `PubSocket`.
 *
 * @api private
 */

function PubSocket() {
  Socket.call(this);
  var self = this;
  this.n = 0;
  this.filters = [];
  this.batch = new Batch;
  this.option('batch max', 10);
  this.option('batch ttl', 100);
  process.nextTick(function(){
    var ttl = self.option('batch ttl');
    self.batchTimer = setInterval(self.flushBatch.bind(self), ttl);
  });
}

/**
 * Inherits from `Socket.prototype`.
 */

PubSocket.prototype.__proto__ = Socket.prototype;

/**
 * Flush the batch.
 *
 * @api private
 */

PubSocket.prototype.flushBatch = function(){
  if (this.batch.empty()) return;

  var socks = this.socks
    , len = socks.length
    , msg = this.batch.toBuffer()
    , sock;

  for (var i = 0; i < len; ++i) {
    sock = socks[i];
    sock.write(msg);
  }

  this.batch.clear();
  this.n = 0;
};

/**
 * Send `msg` to all established peers.
 *
 * Messages will be batched rather then sent immediately
 * until the batch reaches the option `batch max`.
 *
 * @param {Mixed} msg
 * @api public
 */

PubSocket.prototype.send = function(msg){
  if (++this.n == this.option('batch max')) return this.flushBatch();
  msg = Array.isArray(msg)
    ? msg
    : [].slice.call(arguments);
  this.batch.add(this.pack(msg));
  return this;
};

/**
 * Close the pub socket.
 *
 * @api public
 */

PubSocket.prototype.close = function(){
  clearInterval(this.batchTimer);
  return Socket.prototype.close.call(this);
};
