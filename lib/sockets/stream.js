
/**
 * Module dependencies.
 */

var uid = require('uid2')
  , slice = require('../utils').slice
  , Emitter = require('events').EventEmitter;

/**
 * Expose `Stream`.
 */

module.exports = Stream;

/**
 * Initialize a new `Stream`
 * with the given parent `channel`.
 *
 * @param {Channel} channel
 * @param {String} [id]
 * @api private
 */

function Stream(channel, id) {
  this.writable = true;
  this.id = id || uid(6);
  this.channel = channel;
}

/**
 * Inherit from `Emitter.prototype`.
 */

Stream.prototype.__proto__ = Emitter.prototype;

/**
 * Send `msg`.
 *
 * @param {Mixed} msg
 * @api public
 */

Stream.prototype.write =
Stream.prototype.send = function(){
  var args = slice(arguments);
  args.unshift(this.id);
  this.channel.send.apply(this.channel, args);
  return this;
};

/**
 * End the stream.
 *
 * @api public
 */

Stream.prototype.end = function() {
  this.channel.send('end', this.id);
};