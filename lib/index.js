
/**
 * Constructors.
 */

exports.Parser = require('./parser');
exports.Message = require('./message');
exports.Socket = require('./sockets/sock');
exports.PubSocket = require('./sockets/pub');
exports.SubSocket = require('./sockets/sub');
exports.PushSocket = require('./sockets/push');
exports.PullSocket = require('./sockets/pull');
exports.PubEmitterSocket = require('./sockets/pub-emitter');
exports.SubEmitterSocket = require('./sockets/sub-emitter');
exports.ReqSocket = require('./sockets/req');
exports.RepSocket = require('./sockets/rep');

/**
 * Socket types.
 */

exports.types = {
  'pub': exports.PubSocket,
  'sub': exports.SubSocket,
  'push': exports.PushSocket,
  'pull': exports.PullSocket,
  'pub-emitter': exports.PubEmitterSocket,
  'sub-emitter': exports.SubEmitterSocket,
  'req': exports.ReqSocket,
  'rep': exports.RepSocket
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
