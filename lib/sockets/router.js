
/**
 * Module dependencies.
 */

var Socket = require('./sock')
  , debug = require('debug')('axon:router');

/**
 * Expose `RouterSocket`.
 */

module.exports = RouterSocket;

/**
 * Initialize a new `RouterSocket`.
 *
 * @api private
 */

function RouterSocket() {
  Socket.call(this);
}

/**
 * Inherits from `Socket.prototype`.
 */

RouterSocket.prototype.__proto__ = Socket.prototype;

/**
 * Sent `msg` to a connected peer with
 * the identity `id`.
 *
 * @param {String} id
 * @param {Mixed} msg
 */

RouterSocket.prototype.send = function(id, msg) {
  var args = [].slice.call(arguments);

  if (args.length < 2) throw new Error('identity is required');
  if ('string' != typeof args[0]) throw new Error('invalid identity');

  var sock = this.map[id];

  if (sock) {
    sock.write(this.pack(args.slice(1)));
  } else {
    debug('no peer "%s"', id);
  }
};

/**
 * Emits the "message" event with all message parts
 * after the null delimeter part. Uses the "identity"
 * from the remote peer as the "envelope" part.
 *
 * @param {net.Socket} sock
 * @return {Function} closure(msg, multipart)
 * @api private
 */

RouterSocket.prototype.onmessage = function(socket){
  var self = this;
  return function(msg, multipart){
    var id = socket._axon_id;
    self.emit.apply(self, ['message', id].concat(msg));
  };
};


