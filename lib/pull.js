
/**
 * Module dependencies.
 */

var Queue = require('./queue');

/**
 * Expose `PullSocket`.
 */

module.exports = PullSocket;

/**
 * Initialize a new `PullSocket`.
 *
 * @api private
 */

function PullSocket() {
  Queue.call(this);
  // TODO: selective reception
}

/**
 * Inherits from `Queue.prototype`.
 */

PullSocket.prototype.__proto__ = Queue.prototype;
