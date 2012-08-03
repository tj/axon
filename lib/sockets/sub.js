
/**
 * Module dependencies.
 */

var Queue = require('./queue');

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
  Queue.call(this);
  this.subscriptions = [];
}

/**
 * Subscribers should not send messages.
 */

SubSocket.prototype.send = function(){
  throw new Error('subscribers should not send messages');
};

/**
 * Inherits from `Queue.prototype`.
 */

SubSocket.prototype.__proto__ = Queue.prototype;
