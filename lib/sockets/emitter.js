
/**
 * Module dependencies.
 */

var PubSocket = require('./pub')
  , SubSocket = require('./sub')
  , Emitter = require('events').EventEmitter;

/**
 * Expose `EmitterSocket`.
 */

module.exports = EmitterSocket;

/**
 * Initialzie a new `EmitterSocket`.
 *
 * @api private
 */

function EmitterSocket(){}

/**
 * Inherits from `Emitter.prototype`.
 */

EmitterSocket.prototype.__proto__ = Emitter.prototype;

/**
 * Bind as a `PubSocket`.
 *
 * @api public
 */

EmitterSocket.prototype.bind = function(){
  this.pub = new PubSocket;
  this.pub.format('json');
  this.emit = emit;
  return this.pub.bind.apply(this.pub, arguments);
};

/**
 * Connect as a `SubSocket`.
 *
 * @api public
 */

EmitterSocket.prototype.connect = function(){
  var self = this;
  this.sub = new SubSocket;
  this.sub.on('message', function(){
    self.emit.apply(self, arguments);
  });
  return this.sub.connect.apply(this.sub, arguments);
};

/**
 * Close the pub or sub socket.
 *
 * @api public
 */

EmitterSocket.prototype.close = function(){
  return (this.sub || this.pub).close();
};

/**
 * Emit `event` and the given args to all established peers.
 *
 * @param {String} event
 * @api public
 */

function emit(event){
  this.pub.send.apply(this.pub, arguments);
}