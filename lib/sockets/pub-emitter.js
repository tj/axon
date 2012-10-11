
/**
 * Module dependencies.
 */

var PubSocket = require('./pub')
  , Emitter = require('events').EventEmitter;

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
  this.emit = emit;
}

/**
 * Inherits from `Emitter.prototype`.
 */

PubEmitterSocket.prototype.__proto__ = Emitter.prototype;

/**
 * Bind, see `Socket#bind()`.
 *
 * @api public
 */

PubEmitterSocket.prototype.bind = function(){
  return this.sock.bind.apply(this.sock, arguments);
};

/**
 * Close the pub socket.
 *
 * @api public
 */

PubEmitterSocket.prototype.close = function(){
  return this.sock.close();
};

/**
 * Emit `event` and the given args to all established peers.
 *
 * @param {String} event
 * @api public
 */

function emit(event){
  this.sock.send.apply(this.sock, arguments);
}