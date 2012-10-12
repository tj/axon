
/**
 * Module dependencies.
 */

var PubSocket = require('./pub');

/**
 * Expose `EmitterSocket`.
 */

module.exports = EmitterSocket;

/**
 * Initialzie a new `EmitterSocket`.
 *
 * @api private
 */

function EmitterSocket(){
  PubSocket.call(this);
  this.format('json');
}

/**
 * Inherits from `PubSocket.prototype`.
 */

EmitterSocket.prototype.__proto__ = PubSocket.prototype;

/**
 * Emit "events" upon the "message" event.
 */

EmitterSocket.prototype.onmessage = function(){
  var self = this;
  return function(msg, multipart){
    if (!multipart) msg = [msg];
    self.emit.apply(self, msg);
  };
};