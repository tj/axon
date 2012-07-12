
/**
 * Library version.
 */

exports.version = '0.0.1';

/**
 * Constructors.
 */

exports.Socket = require('./sock');
exports.Queue = require('./queue');
exports.PubSocket = require('./pub');
exports.SubSocket = require('./sub');
exports.PushSocket = require('./push');
exports.PullSocket = require('./pull');
exports.EmitterSocket = require('./emitter');

/**
 * Socket types.
 */

exports.types = {
  stream: exports.Socket,
  queue: exports.Queue,
  pub: exports.PubSocket,
  sub: exports.SubSocket,
  push: exports.PushSocket,
  pull: exports.PullSocket,
  emitter: exports.EmitterSocket
};

/**
 * Codecs.
 */

exports.codecs = require('./codecs');

/**
 * Return a new socket of the given `type`.
 *
 * @param {String} type
 * @param {Object} options
 * @return {Socket}
 * @api public
 */

exports.socket = function(type, options){
  var fn = exports.types[type];
  if (!fn) throw new Error('invalid socket type "' + type + '"');
  return new fn(options);
};