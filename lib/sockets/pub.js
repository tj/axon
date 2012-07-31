
/**
 * Module dependencies.
 */

var Queue = require('./queue')
  , Batch = require('../batch');

/**
 * Expose `PubSocket`.
 */

module.exports = PubSocket;

/**
 * Initialzie a new `PubSocket`.
 *
 * @api private
 */

function PubSocket() {
  Queue.call(this);
  this.filters = [];
  this.batch = new Batch;
  this.batchMax = 10;
  this.batchTTL = 100;
  this.batchTimer = setInterval(this.flushBatch.bind(this), this.batchTTL);
  this.n = 0;
}

/**
 * Inherits from `Queue.prototype`.
 */

PubSocket.prototype.__proto__ = Queue.prototype;

/**
 * Flush the batch.
 *
 * @api private
 */

PubSocket.prototype.flushBatch = function(){
  if (!this.batch.msgs.length) return;
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
 * @param {Mixed} msg
 * @api public
 */

PubSocket.prototype.send = function(msg){
  var codec = this.codec;
  var msg = this.encoder.pack(codec.encode(msg), codec.id);

  if (++this.n == this.batchMax) {
    this.flushBatch();
  } else {
    this.batch.add(msg);
  }
};

/**
 * Close the pub socket.
 *
 * @api public
 */

PubSocket.prototype.close = function(){
  clearInterval(this.batchTimer);
  return Queue.prototype.close.call(this);
};
