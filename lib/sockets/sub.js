
/**
 * Module dependencies.
 */

var Socket = require('./sock');

/**
 * Expose `SubSocket`.
 */

module.exports = SubSocket;

/**
 * Initialize a new `SubSocket`.
 *
 * @api private
 */

function SubSocket() {
  Socket.call(this);
  this.subscriptions = [];
}

/**
 * Inherits from `Socket.prototype`.
 */

SubSocket.prototype.__proto__ = Socket.prototype;

/**
 * Subscribers should not send messages.
 */

SubSocket.prototype.send = function(){
  throw new Error('subscribers should not send messages');
};
