
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
    , fmt = this._format
    , msg = this.pack(this.encode(msg, fmt), fmt)
    , len = socks.length
    , sock;

  for (var i = 0; i < len; ++i) {
    sock = socks[i];
    sock.write(msg);
  }
};
