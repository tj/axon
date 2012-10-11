
/**
 * Module dependencies.
 */

var SubSocket = require('./sub')
  , Emitter = require('events').EventEmitter;

/**
 * Expose `SubEmitterSocket`.
 */

module.exports = SubEmitterSocket;

/**
 * Initialzie a new `SubEmitterSocket`.
 *
 * @api private
 */

function SubEmitterSocket() { 
  var self = this;
  this.sock = new SubSocket;
  this.sock.format('json');
  this.sock.on('message', function(){
    self.emit.apply(self, arguments);
  });
}

/**
 * Inherits from `Emitter.prototype`.
 */

SubEmitterSocket.prototype.__proto__ = Emitter.prototype;

/**
 * Bind, see `Socket#bind()`.
 *
 * @api public
 */

SubEmitterSocket.prototype.bind = function(){
  return this.sock.bind.apply(this.sock, arguments);
};

/**
 * Connect, see `Socket#connect()`.
 *
 * @api public
 */

SubEmitterSocket.prototype.connect = function(){
  return this.sock.connect.apply(this.sock, arguments);
};

/**
 * Close the sub socket.
 *
 * @api public
 */

SubEmitterSocket.prototype.close = function(){
  return this.sock.close();
};
