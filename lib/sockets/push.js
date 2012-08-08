
/**
 * Module dependencies.
 */

var Socket = require('./sock')
  , queue = require('../plugins/queue')
  , roundrobin = require('../plugins/round-robin');

/**
 * Expose `PushSocket`.
 */

module.exports = PushSocket;

/**
 * Initialize a new `PushSocket`.
 *
 * @api private
 */

function PushSocket() {
  Socket.call(this);
  this.use(queue());
  this.use(roundrobin({ fallback: this.enqueue }));
}

/**
 * Inherits from `Socket.prototype`.
 */

PushSocket.prototype.__proto__ = Socket.prototype;