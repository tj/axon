
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
 * Inherits from `Queue.prototype`.
 */

SubSocket.prototype.__proto__ = Queue.prototype;
