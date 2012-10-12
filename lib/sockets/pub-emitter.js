
/**
 * Module dependencies.
 */

var PubSocket = require('./pub');

/**
 * Expose `SubPubEmitterSocket`.
 */

module.exports = PubEmitterSocket;

/**
 * Initialzie a new `PubEmitterSocket`.
 *
 * @api private
 */

function PubEmitterSocket() {
  this.sock = new PubSocket;
  this.sock.format('json');
}

/**
 * Emit `event` and the given args to all established peers.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @api public
 */

PubEmitterSocket.prototype.emit = function(){
  this.sock.send.apply(this.sock, arguments);
};

/**
 * Bind, see `Socket#bind()`.
 *
 * @api public
 */

PubEmitterSocket.prototype.bind = function(){
  return this.sock.bind.apply(this.sock, arguments);
};

/**
 * Connect, see `Socket#connect()`.
 *
 * @api public
 */

PubEmitterSocket.prototype.connect = function(){
  return this.sock.connect.apply(this.sock, arguments);
};

/**
 * Close the pub socket.
 *
 * @api public
 */

PubEmitterSocket.prototype.close = function(){
  return this.sock.close();
};
