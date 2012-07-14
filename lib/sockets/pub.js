
/**
 * Module dependencies.
 */

var Queue = require('./queue');

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
}

/**
 * Inherits from `Queue.prototype`.
 */

PubSocket.prototype.__proto__ = Queue.prototype;

/**
 * Send `msg` to all established peers.
 *
 * @param {Mixed} msg
 * @api public
 */

PubSocket.prototype.send = function(msg){
  var socks = this.socks
    , codec = this.parser.codec
    , msg = this.parser.pack(codec.encode(msg), codec.id)
    , len = socks.length
    , sock;

  for (var i = 0; i < len; ++i) {
    sock = socks[i];
    sock.write(msg);
  }
};
