
/**
 * Module dependencies.
 */

var Socket = require('./sock')
  , queue = require('../plugins/queue')
  , roundrobin = require('../plugins/round-robin');

/**
 * Expose `DealerSocket`.
 */

module.exports = DealerSocket;

/**
 * Initialize a new `DealerSocket`.
 *
 * @api private
 */

function DealerSocket() {
  Socket.call(this);
  this.use(queue());
  this.use(roundrobin({ fallback: this.enqueue }));
}

/**
 * Inherits from `Socket.prototype`.
 */

DealerSocket.prototype.__proto__ = Socket.prototype;