
/**
 * Module dependencies.
 */

var Socket = require('./sock')
  , debug = require('debug')('axon:queue')
  , net = require('net');

/**
 * Expose `Queue`.
 */

exports = module.exports = Queue;

/**
 * Initialize a new `Queue`.
 *
 * A "Queue" encapsulates the buffering and flushing
 * of outgoing messages as peers connect and disconnect.
 *
 * @api private
 */

function Queue() {
  Socket.call(this);
  this.buf = [];
  this.on('connect', this.flush.bind(this));
}

/**
 * Inherit from `Socket.prototype`.
 */

Queue.prototype.__proto__ = Socket.prototype;

/**
 * Flush queued messages.
 *
 * @api private
 */

Queue.prototype.flush = function(){
  var buf = this.buf;
  var len = buf.length;
  this.buf = [];
  debug('flush %d messages', len);
  for (var i = 0; i < len; ++i) {
    this.send(buf[i]);
  }
};

