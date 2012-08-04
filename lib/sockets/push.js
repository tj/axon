
/**
 * Module dependencies.
 */

var Queue = require('./queue');

/**
 * Expose `PushSocket`.
 */

module.exports = PushSocket;

/**
 * Initialize a new `PushSocket`.
 *
 * @api private
 */

function PushSocket() {
  Queue.call(this);
  this.n = 0;
}

/**
 * Inherits from `Queue.prototype`.
 */

PushSocket.prototype.__proto__ = Queue.prototype;

/**
 * Send `msg` round-robin to established peers.
 *
 * @param {Mixed} msg
 * @api public
 */

PushSocket.prototype.send = function(msg){
  var socks = this.socks
    , len = socks.length
    , sock = socks[this.n++ % len];

  if (sock) {
    sock.write(this.pack(msg));
  } else {
    this.buf.push(msg);
  }
};