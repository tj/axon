
/**
 * Module dependencies.
 */

var Socket = require('./sock')
  , slice = require('../utils').slice;

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
}

/**
 * Inherits from `Socket.prototype`.
 */

PubSocket.prototype.__proto__ = Socket.prototype;

/**
 * Send `msg` to all established peers.
 *
 * @param {Mixed} msg
 * @api public
 */

PubSocket.prototype.send = function(msg){
  var socks = this.socks
    , len = socks.length
    , sock;

  if (arguments.length > 1) msg = slice(arguments);
  msg = this.pack(msg);

  for (var i = 0; i < len; i++) {
    sock = socks[i];
    if (sock.writable) sock.write(msg);
  }

  return this;
};
