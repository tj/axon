
/**
 * Library version.
 */

exports.version = '0.0.1';

/**
 * Constructors.
 */

exports.Batch = require('./batch');
exports.Parser = require('./parser');
exports.Message = require('./message');
exports.Socket = require('./sockets/sock');
exports.PubSocket = require('./sockets/pub');
exports.SubSocket = require('./sockets/sub');
exports.PushSocket = require('./sockets/push');
exports.PullSocket = require('./sockets/pull');
exports.EmitterSocket = require('./sockets/emitter');
exports.RouterSocket = require('./sockets/router');

/**
 * Socket types.
 */

exports.types = {
  stream: exports.Socket,
  pub: exports.PubSocket,
  sub: exports.SubSocket,
  push: exports.PushSocket,
  pull: exports.PullSocket,
  emitter: exports.EmitterSocket,
  router: exports.RouterSocket
};

/**
 * Codecs.
 */

exports.codec = require('./codecs');

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